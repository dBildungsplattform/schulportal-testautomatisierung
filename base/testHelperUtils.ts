import { type Page } from '@playwright/test';

export async function gotoTargetURL(page: Page, target: string): Promise<void> {
  await page.goto(target);
}
