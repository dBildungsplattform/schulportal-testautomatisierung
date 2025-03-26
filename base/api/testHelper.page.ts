import { Page } from '@playwright/test';

export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
}

export async function waitForAPIResponse(page: Page, lastEndpoint: string): Promise<void> {
  await page.waitForResponse('/api/' + lastEndpoint);
}
