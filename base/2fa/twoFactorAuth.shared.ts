import { expect, Locator, Page } from '@playwright/test';
import { TOTP } from 'totp-generator';

import { SharedCredentialManager } from './SharedCredentialManager';

interface GenerateOtpOptions {
  page: Page;
  providedKey?: string;
  username?: string;
  expires?: number;
  allowEnvFallback?: boolean;
}

export async function isLocatorVisible(locator: Locator): Promise<boolean> {
  try {
    await locator.waitFor({ timeout: 10 * 1000, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}

export async function submitOtpWithRetry(options: {
  getOtp: () => Promise<string>;
  submitOtp: (otp: string) => Promise<void>;
  errorLocator: Locator;
}): Promise<void> {
  const { getOtp, submitOtp, errorLocator } = options;

  await submitOtp(await getOtp());

  // Retry once if a token expired during submission.
  if (await isLocatorVisible(errorLocator)) {
    await submitOtp(await getOtp());
  }

  await expect(errorLocator).toBeHidden();
}

export async function generateCurrentOtp(options: GenerateOtpOptions): Promise<{ otp: string; expires: number }> {
  const { page, providedKey, username, expires, allowEnvFallback = false } = options;

  const key: string | undefined = resolveOtpKey(providedKey, username, allowEnvFallback);

  if (!key) {
    throw new Error(
      `No OTP seed found for user ${username} and TEST_PARALLEL_INDEX ${process.env.TEST_PARALLEL_INDEX}`,
    );
  }

  if (expires) {
    const currentTime: number = Date.now();
    const timeLeft: number = expires - currentTime;

    if (timeLeft > 0) {
      await page.waitForTimeout(timeLeft + 100);
    }
  }

  const result: { otp: string; expires: number } = await TOTP.generate(key);
  return result;
}

function resolveOtpKey(providedKey?: string, username?: string, allowEnvFallback: boolean = false): string | undefined {
  if (providedKey) {
    return providedKey;
  }

  if (username) {
    const workerParallelIndex: string = process.env['TEST_PARALLEL_INDEX']!;
    if (SharedCredentialManager.getUsername(workerParallelIndex) === username) {
      return SharedCredentialManager.getOtpSeed(workerParallelIndex);
    }
    if (username === process.env['USER']) {
      return SharedCredentialManager.getOtpSeed();
    }
  }

  if (allowEnvFallback) {
    return process.env.OTP_SECRET;
  }

  return undefined;
}
