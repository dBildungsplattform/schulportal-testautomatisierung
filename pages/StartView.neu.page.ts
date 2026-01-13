import { expect, Locator, Page, Response } from '@playwright/test';
import { PersonManagementViewPage } from './admin/personen/PersonManagementView.neu.page';
import { TwoFactorWorkflowPage } from './TwoFactorWorkflow.page';
export class StartViewPage {
  /* add global locators here */
  readonly startCardHeadline: Locator;

  constructor(protected readonly page: Page) {
    this.startCardHeadline = this.page.locator('[data-testid="start-card-headline"]');
  }

  /* actions */
  public async waitForPageLoad(): Promise<StartViewPage> {
    await this.startCardHeadline.waitFor({ state: 'visible' });
    await expect(this.startCardHeadline).toHaveText('Startseite');
    return this;
  }

  public async navigateToAdministration(): Promise<PersonManagementViewPage> {
    await this.page.locator('[data-testid^="service-provider-card"]').filter({ hasText: 'Schulportal-Administration' }).click();

    const twoFactorWorkflowPage: TwoFactorWorkflowPage = new TwoFactorWorkflowPage(this.page);
    return twoFactorWorkflowPage.complete();
  }

  /* assertions */
  public async serviceProvidersAreLoaded(): Promise<void> {
    await this.page.waitForResponse(
      (response: Response) => response.url().includes('/api/provider') && response.status() === 200
    );
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.page.getByTestId('all-service-provider-title')).toBeVisible();
  }

  public async serviceProvidersAreVisible(serviceProviderNames: string[]): Promise<void> {
    await Promise.all(
      serviceProviderNames.map(async (serviceProviderName: string) => {
        const serviceProviderCard: Locator = this.page.locator(`[data-testid^="service-provider-card"]`, {
          hasText: serviceProviderName,
        });
        await expect(serviceProviderCard).toBeVisible();
        await expect(serviceProviderCard.locator('img')).toBeVisible();
      })
    );
  }
}