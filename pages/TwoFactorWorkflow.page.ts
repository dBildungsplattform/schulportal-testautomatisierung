import { expect, Locator, Page } from '@playwright/test';
import jsQR, { QRCode } from 'jsqr';
import { PNG } from 'pngjs';
import { TOTP } from 'totp-generator';

import { PersonManagementViewPage } from './admin/personen/PersonManagementView.neu.page';
import { ProfileViewPage } from './ProfileView.neu.page';

interface TwoFactorSetupResult {
  page: ProfileViewPage;
  otpSecret: string;
}

export class TwoFactorWorkflowPage {
  constructor(protected readonly page: Page) {}

  public async complete(): Promise<PersonManagementViewPage> {
    const setupButton: Locator = this.getSecondFactorSetupButtonLocator();
    const requires2FASetup: boolean = await this.isLocatorVisible(setupButton);
    let otpSecret: string | undefined;
    if (requires2FASetup) {
      const result: TwoFactorSetupResult = await this.setupTwoFactorAuthentication();
      otpSecret = result.otpSecret;
      await this.page.goto('/admin/personen');
    }

    const otpInput: Locator = this.getOtpInputLocator();
    const requires2FA: boolean = await otpInput.isVisible({ timeout: 10 * 1000});
    if (requires2FA) {
      const otp: string = await this.getOtp(otpSecret);
      await this.fillOtpAndConfirm(otp);
    }
    return new PersonManagementViewPage(this.page).waitForPageLoad();
  }

  private async isLocatorVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ timeout: 10 * 1000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

  private async setupTwoFactorAuthentication(): Promise<TwoFactorSetupResult> {
    await this.getSecondFactorSetupButtonLocator().click();
    const profileViewPage = await new ProfileViewPage(this.page).waitForPageLoad();
    await profileViewPage.open2FADialog();
    await profileViewPage.proceedTo2FAQrCode();

    const otpSecret: string | null = await this.getOtpSecretFromQRCode();
    const otp: string = await this.getOtp(otpSecret);

    await profileViewPage.proceedToOtpEntry();
    for (let index = 0; index < otp.length; index++) {
      const digit: string = otp.at(index);
      await this.page.getByTestId('self-service-otp-input').locator('input').nth(index).fill(digit);
    }
    await this.page.getByTestId('proceed-two-factor-authentication-dialog').click();
    return { page: await new ProfileViewPage(this.page).waitForPageLoad(), otpSecret };
  }

  private async getOtpSecretFromQRCode() {
    const qrCode: QRCode = await this.getQRCodeFromImage();

    const url: URL = new URL(qrCode.data);
    const otpSecret: string | null = url.searchParams.get('secret');
    if (!otpSecret) {
      throw new Error('OTP secret not found in QR code URL');
    }
    return otpSecret;
  }

  private async getQRCodeFromImage() {
    const qrCodeSrc: string = await this.page
      .getByTestId('software-token-dialog-qr-code')
      .locator('img')
      .getAttribute('src');
    const base64Data: string = qrCodeSrc.replace('data:image/png;base64,', '');
    const buffer: Buffer = Buffer.from(base64Data, 'base64');
    let img: PNG = new PNG();
    img = PNG.sync.read(buffer);
    const qrCode: QRCode = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
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

  private async getOtp(key?: string): Promise<string> {
    let otpKey: string | undefined = key ?? process.env['OTP_SEED_B32'];
    const { otp } = await TOTP.generate(otpKey);
    return otp;
  }
}
