import { expect, Locator, Page } from '@playwright/test';
import { TOTP } from 'totp-generator';

import { SharedCredentialManager } from '../base/2fa';

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
    const otp: string = await this.generateCurrentOtp(otpKey);
    await this.fillOtpAndConfirm(otp);
    const errorMessageLocator: Locator = this.page.locator('[role="alert"]');
    // try to recover from possible failed attempts due to timing issues
    if (await this.isLocatorVisible(errorMessageLocator)) {
      const otp: string = await this.generateCurrentOtp(otpKey);
      await this.fillOtpAndConfirm(otp);
    }
    await expect(errorMessageLocator).toBeHidden();
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
    const submitButton: Locator = this.page.getByRole('button', { name: /anmelden/i });
    await expect(submitButton).toBeVisible();
  }

  /* private helpers */
  /** This function swallows errors, so we can use the result to retry. */
  private async isLocatorVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ timeout: 10 * 1000, state: 'visible' });
      return true;
    } catch {
      return false;
    }
  }

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
      await this.page.locator('#otp').fill(otp);
    }

    const submitButton: Locator = this.page.getByRole('button', { name: /anmelden/i });
    await submitButton.click();
  }

  private getOtpInputLocator(): Locator {
    return this.page.locator('#otp');
  }

  private async generateCurrentOtp(providedKey?: string): Promise<string> {
    let key: string | undefined;

    if (providedKey) {
      key = providedKey;
    } else if (this.username) {
      const workerParallelIndex: string = process.env['TEST_PARALLEL_INDEX']!;
      // are we the workers designated root user?
      if (SharedCredentialManager.getUsername(workerParallelIndex) === this.username) {
        key = SharedCredentialManager.getOtpSeed(workerParallelIndex);
      } else if (this.username === process.env['USER']) {
        key = SharedCredentialManager.getOtpSeed();
      }
    }

    if (!key) {
      key = process.env.OTP_SECRET;
    }

    if (!key) {
      throw new Error(
        `No OTP seed found for user ${this.username} and TEST_PARALLEL_INDEX ${process.env.TEST_PARALLEL_INDEX}`,
      );
    }

    if (this.expires) {
      // if we are asked to input two OTPs in a short time, i.e. during setup,
      // we may need to wait for the next token, since repeated entry is not allowed
      const currentTime: number = Date.now();
      const timeLeft: number = this.expires - currentTime;

      if (timeLeft > 0) {
        await this.page.waitForTimeout(timeLeft + 100);
      }
    }

    const {
      otp,
      expires,
    }: {
      otp: string;
      expires: number;
    } = await TOTP.generate(key);
    this.expires = expires;
    return otp;
  }
}
