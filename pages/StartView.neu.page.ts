import { expect, Locator, Page } from '@playwright/test';

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
    await this.serviceProvidersAreLoaded();
  }

  /* assertions */
  private async serviceProvidersAreLoaded(): Promise<void> {
    await this.page.waitForResponse((response) => response.url().includes('/api/provider') && response.status() === 200);
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.page.getByTestId('all-service-provider-title')).toBeVisible();
  }

  public async serviceProviderIsVisible(serviceProviderNames: string[]): Promise<void> {
    for (const serviceProviderName of serviceProviderNames) {
      const serviceProviderCard: Locator = this.page.locator('[data-testid^="service-provider-card"]', { hasText: serviceProviderName });
      await expect(serviceProviderCard).toBeVisible();
      await expect(serviceProviderCard.locator('img')).toBeVisible();
    }
  }
}
