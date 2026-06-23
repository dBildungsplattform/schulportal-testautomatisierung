import { expect, Locator, Page } from '@playwright/test';

import { generateCurrentOtp, submitOtpWithRetry } from '../base/2fa';

export class Keycloak2FAPage {
  private expires: number | undefined;

  constructor(
    protected readonly page: Page,
    private readonly username?: string,
  ) {}

  /* actions */
  public async waitForPageLoad(): Promise<Keycloak2FAPage> {
    const otpInputLocator: Locator = this.getOtpInputLocator();
    await expect(otpInputLocator).toBeVisible({ timeout: 10_000 });
    return this;
  }

  public async enterOtpForTwoFactorAuthentication(otpKey?: string): Promise<void> {
    const errorMessageLocator: Locator = this.page.locator('[role="alert"]');
    await submitOtpWithRetry({
      getOtp: () => this.generateCurrentOtp(otpKey),
      submitOtp: async (otp: string) => this.fillOtpAndConfirm(otp),
      errorLocator: errorMessageLocator,
    });
  }

  public async cancel(): Promise<void> {
    const cancelButton: Locator = this.page.getByRole('link', { name: /abbrechen/i });
    await cancelButton.click();
  }

  /* assertions */
  public async assertOtpInputIsVisible(): Promise<void> {
    const otpInputLocator: Locator = this.getOtpInputLocator();
    await expect(otpInputLocator).toBeVisible();
  }

  public async assertSubmitButtonIsVisible(): Promise<void> {
    const submitButton: Locator = this.getSubmitButtonLocator();
    await expect(submitButton).toBeVisible();
  }

  /* private helpers */
  private async fillOtpAndConfirm(otp: string): Promise<void> {
    const otpInputFields = this.page.locator('#otp input, [data-testid*="otp"] input');
    const count = await otpInputFields.count();

    // Fill field by field if there are multiple fields (digit-by-digit input)
    if (count > 1) {
      for (let index = 0; index < otp.length; index++) {
        const digit: string = otp.at(index)!;
        await otpInputFields.nth(index).fill(digit);
      }
    } else {
      // Otherwise fill the single field
      await this.getOtpInputLocator().fill(otp);
    }

    const submitButton: Locator = this.getSubmitButtonLocator();
    await submitButton.click();
  }

  private getOtpInputLocator(): Locator {
    return this.page.locator('#otp');
  }

  private getSubmitButtonLocator(): Locator {
    return this.page.getByRole('button', { name: /anmelden/i });
  }

  private async generateCurrentOtp(providedKey?: string): Promise<string> {
    const { otp, expires }: { otp: string; expires: number } = await generateCurrentOtp({
      page: this.page,
      providedKey,
      username: this.username,
      expires: this.expires,
      allowEnvFallback: true,
    });
    this.expires = expires;
    return otp;
  }
}
