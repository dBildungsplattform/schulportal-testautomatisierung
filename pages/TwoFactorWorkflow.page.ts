import { expect, Locator, Page } from '@playwright/test';
import jsQR, { QRCode } from 'jsqr';
import { PNG } from 'pngjs';
import { TOTP } from 'totp-generator';

import { PersonManagementViewPage } from './admin/personen/PersonManagementView.neu.page';
import { ProfileViewPage } from './ProfileView.neu.page';
import { Env } from '../base/env';

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

  public async completeTwoFactorAuthentication(): Promise<PersonManagementViewPage> {
    const setupButton: Locator = this.getSecondFactorSetupButtonLocator();
    const requires2FASetup: boolean = await this.isLocatorVisible(setupButton);
    let otpSecret: string | undefined;
    if (requires2FASetup) {
      const result: TwoFactorSetupResult = await this.setupTwoFactorAuthenticationFromErrorMessage();
      otpSecret = result.otpSecret;
      await this.page.goto('/admin/personen');
    }

    const otpInput: Locator = this.getOtpInputLocator();
    const requires2FA: boolean = await this.isLocatorVisible(otpInput);
    if (requires2FA) {
      await this.enterOtpForTwoFactorAuthentication(otpSecret);
    }
    return new PersonManagementViewPage(this.page).waitForPageLoad();
  }

  public async setupTwoFactorAuthenticationFromErrorMessage(): Promise<TwoFactorSetupResult> {
    await this.getSecondFactorSetupButtonLocator().click();
    return this.setupTwoFactorAuthenticationFromProfile();
  }

  public async setupTwoFactorAuthenticationFromProfile(): Promise<TwoFactorSetupResult> {
    const profileViewPage = await new ProfileViewPage(this.page).waitForPageLoad();
    await profileViewPage.open2FADialog();
    await profileViewPage.proceedTo2FAQrCode();

    const otpSecret: string = await this.getOtpSecretFromQRCode();
    const otp: string = await this.generateCurrentOtp(otpSecret);

    await profileViewPage.proceedToOtpEntry();
    for (let index = 0; index < otp.length; index++) {
      const digit: string = otp.at(index)!;
      await this.page.getByTestId('self-service-otp-input').locator('input').nth(index).fill(digit);
    }
    await this.page.getByTestId('proceed-two-factor-authentication-dialog').click();
    return { page: await new ProfileViewPage(this.page).waitForPageLoad(), otpSecret };
  }

  public async enterOtpForTwoFactorAuthentication(otpKey?: string): Promise<void> {
    const otp: string = await this.generateCurrentOtp(otpKey);
    await this.fillOtpAndConfirm(otp);
    await expect(this.page.getByTestId('login-error-message')).toBeHidden();
  }

  private async isLocatorVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ timeout: 10 * 1000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  private async getOtpSecretFromQRCode(): Promise<string> {
    const qrCode: QRCode = await this.getQRCodeFromImage();

    const url: URL = new URL(qrCode.data);
    const otpSecret: string | null = url.searchParams.get('secret');
    if (!otpSecret) {
      throw new Error('OTP secret not found in QR code URL');
    }
    if (this.username) {
      const workerParallelIndex: string = process.env['TEST_PARALLEL_INDEX']!;
      if (Env.getUsername(workerParallelIndex) === this.username) {
        Env.setOtpSeed(otpSecret, workerParallelIndex);
      }
    }
    return otpSecret;
  }

  private async getQRCodeFromImage(): Promise<QRCode> {
    const qrCodeSrc: string | null = await this.page
      .getByTestId('software-token-dialog-qr-code')
      .locator('img')
      .getAttribute('src');
    expect(qrCodeSrc).not.toBeNull();
    const base64Data: string = qrCodeSrc!.replace('data:image/png;base64,', '');
    const buffer: Buffer = Buffer.from(base64Data, 'base64');
    let img: PNG = new PNG();
    img = PNG.sync.read(buffer);
    const qrCode: QRCode | null = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
    if (!qrCode) {
      throw new Error('Failed to decode QR code from image');
    }
    return qrCode;
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

  private async generateCurrentOtp(key?: string): Promise<string> {
    let otpKey: string | undefined;
    if (key) {
      otpKey = key;
    } else if (this.username) {
      const workerParallelIndex: string = process.env['TEST_PARALLEL_INDEX']!;
      // are we the workers designated root user?
      if (Env.getUsername(workerParallelIndex) === this.username) {
        otpKey = Env.getOtpSeed(workerParallelIndex)!;
      }
    } 
    if (!otpKey) {
      // fallback to global root
      otpKey = Env.getOtpSeed();
    }

    if (!otpKey) {
      throw new Error('OTP key not provided and environment variable is not set');
    }
    
    if (this.expires) {
      const currentTime: number = Date.now();
      const timeLeft: number = this.expires - currentTime;
      await this.page.waitForTimeout(timeLeft + 100);
    }

    const { otp, expires } = await TOTP.generate(otpKey);
    this.expires = expires;
    return otp;
  }
}
