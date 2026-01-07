import { Page } from '@playwright/test';

export const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export async function waitForAPIResponse(page: Page, endpoint: string): Promise<void> {
  await page.waitForResponse('/api/' + endpoint + '*');
}