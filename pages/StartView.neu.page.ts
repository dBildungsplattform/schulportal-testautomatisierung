import { expect, type Locator, Page } from '@playwright/test';

export class StartViewPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('start-card-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('start-card-headline')).toHaveText('Startseite');
  }

  /* assertions */
  public async serviceProvidersAreLoaded(): Promise<void> {
    await this.page.waitForResponse((response) => response.url().includes('/api/provider') && response.status() === 200);
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.page.getByTestId('all-service-provider-title')).toBeVisible();
  }

  public async checkSpIsVisible(spNames: string[]): Promise<void> {
    for (const spName of spNames) {
      const spCard = this.page.locator('[data-testid^="service-provider-card"]', { hasText: spName });
      await expect(spCard).toBeVisible();
      await expect(spCard.locator('img')).toBeVisible();
    }
  }
}
