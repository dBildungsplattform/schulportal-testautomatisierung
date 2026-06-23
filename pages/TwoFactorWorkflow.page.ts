import { expect, Locator, Page } from '@playwright/test';

import {
  generateCurrentOtp,
  getSecretFromTokenQRCode,
  isLocatorVisible,
  SharedCredentialManager,
  submitOtpWithRetry,
} from '../base/2fa';
import { PersonManagementViewPage } from './admin/personen/PersonManagementView.page';
import { ProfileViewPage } from './ProfileView.page';

export interface TwoFactorSetupResult {
  page: ProfileViewPage;
  otpSecret: string;
}

export class TwoFactorWorkflowPage {
  private expires: number | undefined;

  constructor(
    protected readonly page: Page,
    private readonly username?: string,
  ) {}

  public async completeTwoFactorAuthentication<T = PersonManagementViewPage>(
    redirectUrl: string = '/admin/personen',
    waitForPageLoad: () => Promise<T> = async () =>
      new PersonManagementViewPage(this.page).waitForPageLoad() as Promise<T>,
  ): Promise<T> {
    const setupButton: Locator = this.getSecondFactorSetupButtonLocator();
    const requires2FASetup: boolean = await isLocatorVisible(setupButton);
    let otpSecret: string | undefined;
    if (requires2FASetup) {
      const result: TwoFactorSetupResult = await this.setupTwoFactorAuthenticationFromErrorMessage();
      otpSecret = result.otpSecret;
      await this.page.goto(redirectUrl);
    }

    const otpInput: Locator = this.getOtpInputLocator();
    const requires2FA: boolean = await isLocatorVisible(otpInput);
    if (requires2FA) {
      await this.enterOtpForTwoFactorAuthentication(otpSecret);
    }
    return waitForPageLoad();
  }

  public async setupTwoFactorAuthenticationFromErrorMessage(): Promise<TwoFactorSetupResult> {
    await this.getSecondFactorSetupButtonLocator().click();
    return this.setupTwoFactorAuthenticationFromProfile();
  }

  public async setupTwoFactorAuthenticationFromProfile(): Promise<TwoFactorSetupResult> {
    const profileViewPage: ProfileViewPage = await new ProfileViewPage(this.page).waitForPageLoad();
    await profileViewPage.open2FADialog();
    await profileViewPage.proceedTo2FAQrCode();
    await expect(this.page.getByTestId('self-service-token-init-error-text')).toBeHidden(); // fail-fast

    const otpSecret: string = await this.getOtpSecretFromQRCode();
    const otp: string = await this.generateCurrentOtp(otpSecret);

    await profileViewPage.proceedToOtpEntry();
    for (let index: number = 0; index < otp.length; index++) {
      const digit: string = otp.at(index)!;
      await this.page.getByTestId('self-service-otp-input').locator('input').nth(index).fill(digit);
    }
    const setupButton: Locator = this.page.getByTestId('proceed-two-factor-authentication-dialog');
    await setupButton.click();
    await expect(setupButton).toBeHidden();

    this.saveOtpSecretInEnv(otpSecret); // only save the secret if setup was successful

    return { page: await new ProfileViewPage(this.page).waitForPageLoad(), otpSecret };
  }

  public async enterOtpForTwoFactorAuthentication(otpKey?: string): Promise<void> {
    const errorMessageLocator: Locator = this.page.getByTestId('login-error-message');
    await submitOtpWithRetry({
      getOtp: () => this.generateCurrentOtp(otpKey),
      submitOtp: async (otp: string) => this.fillOtpAndConfirm(otp),
      errorLocator: errorMessageLocator,
    });
  }

  private async getOtpSecretFromQRCode(): Promise<string> {
    const qrCodeSrc: string | null = await this.page
      .getByTestId('software-token-dialog-qr-code')
      .locator('img')
      .getAttribute('src');
    expect(qrCodeSrc).not.toBeNull();

    const otpSecret: string | null = getSecretFromTokenQRCode(qrCodeSrc!);
    if (!otpSecret) {
      throw new Error('OTP secret not found in QR code URL');
    }
    return otpSecret;
  }

  /**
   * Saves the OTP secret in the environment, if the current user matches the worker's designated root user.
   * This should only be called during first-time 2FA setup, and not during regular login.
   * @param otpSecret
   */
  private saveOtpSecretInEnv(otpSecret: string): void {
    if (this.username) {
      const workerParallelIndex: string = process.env['TEST_PARALLEL_INDEX']!;
      if (SharedCredentialManager.getUsername(workerParallelIndex) === this.username) {
        SharedCredentialManager.setOtpSeed(otpSecret, workerParallelIndex);
      }
    }
  }

  private async fillOtpAndConfirm(otp: string): Promise<void> {
    const otpInput: Locator = this.getOtpInputLocator();
    await otpInput.fill(otp);
    await this.page.locator('#kc-login').click();
  }

  private getSecondFactorSetupButtonLocator(): Locator {
    return this.page.getByTestId('toSecondFactorSetup-button');
  }

  private getOtpInputLocator(): Locator {
    return this.page.locator('#otp');
  }

  private async generateCurrentOtp(providedKey?: string): Promise<string> {
    const { otp, expires }: { otp: string; expires: number } = await generateCurrentOtp({
      page: this.page,
      providedKey,
      username: this.username,
      expires: this.expires,
    });
    this.expires = expires;
    return otp;
  }
}
