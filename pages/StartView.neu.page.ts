import { expect, Locator, Page } from '@playwright/test';
import { PersonManagementViewPage } from './admin/personen/PersonManagementView.neu.page';
export class StartViewPage {
  /* add global locators here */
  readonly startCardHeadline: Locator;

  constructor(protected readonly page: Page) {
    this.startCardHeadline = this.page.locator('[data-testid="start-card-headline"]');
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.startCardHeadline.waitFor({ state: 'visible' });
    await expect(this.startCardHeadline).toHaveText('Startseite');
  }

  private async navigateTo(cardTitle: string, pageClass: any, waitForPageLoad: (page: any) => Promise<void>): Promise<any> {
    await this.page.getByTestId('card-title').filter({ hasText: cardTitle }).click();
    const newPage: any = new pageClass(this.page);
    await waitForPageLoad.call(newPage);
    return newPage;
  }

  /* assertions */
  public async serviceProvidersAreLoaded(): Promise<void> {
    await this.page.waitForResponse((response) => response.url().includes('/api/provider') && response.status() === 200);
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.page.getByTestId('all-service-provider-title')).toBeVisible();
  }

  public async serviceProviderIsVisible(serviceProviderNames: string[]): Promise<void> {
    await Promise.all([
      ...serviceProviderNames.map(async (serviceProviderName: string) => {
        const serviceProviderCard: Locator = this.page.locator(`[data-testid^="service-provider-card"]`, { hasText: serviceProviderName });
        await expect(serviceProviderCard).toBeVisible();
        await expect(serviceProviderCard.locator('img')).toBeVisible();
      }),
    ]);
  }

  public async navigateToSchulportalAdministration(): Promise<PersonManagementViewPage> {
    return this.navigateTo('Schulportal-Administration', PersonManagementViewPage, p => p.waitForPageLoad());
  }
}
