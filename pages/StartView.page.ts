import { expect, Locator, Page, Response } from '@playwright/test';
import { PersonManagementViewPage } from './admin/personen/PersonManagementView.page';
import { TwoFactorWorkflowPage } from './TwoFactorWorkflow.page';
import { formatDateDMY } from '../base/utils/generateTestdata';
export class StartViewPage {
  /* add global locators here */
  readonly startCardHeadline: Locator;

  constructor(
    protected readonly page: Page,
    private readonly username?: string,
  ) {
    this.startCardHeadline = this.page.locator('[data-testid="start-card-headline"]');
  }

  /* actions */
  public async waitForPageLoad(): Promise<StartViewPage> {
    await expect(this.startCardHeadline).toHaveText('Startseite', { timeout: 60_000 });
    return this;
  }

  public async navigateToAdministration(): Promise<PersonManagementViewPage> {
    await this.getServiceProviderCard('Schulportal-Administration').click();

    const twoFactorWorkflowPage: TwoFactorWorkflowPage = new TwoFactorWorkflowPage(this.page, this.username);
    return twoFactorWorkflowPage.completeTwoFactorAuthentication();
  }

  public async clickServiceProvider(serviceProviderName: string): Promise<void> {
    await this.getServiceProviderCard(serviceProviderName).click();
  }

  public async getServiceProviderUrl(serviceProviderName: string): Promise<string> {
    const href: string | null = await this.getServiceProviderCard(serviceProviderName)
      .locator('a')
      .first()
      .getAttribute('href');
    if (!href) throw new Error(`Kein href gefunden für Service Provider: ${serviceProviderName}`);
    return href;
  }

  public async openServiceProviderInNewTab(serviceProviderName: string): Promise<Page> {
    const newPage: Page = await this.clickServiceProviderAndWaitForNewPage(
      serviceProviderName,
      this.page.context().waitForEvent('page'),
      'load',
    );
    const response = await this.page.request.get(newPage.url());
    expect(response.ok()).toBeTruthy();
    return newPage;
  }

  /* assertions */
  public async assertServiceProvidersAreLoaded(): Promise<void> {
    await this.page.waitForResponse(
      (response: Response) => response.url().includes('/api/provider') && response.status() === 200,
    );
    await expect(this.page.getByTestId('all-service-provider-title')).toBeVisible();
  }

  public async assertServiceProvidersAreVisible(serviceProviderNames: string[]): Promise<void> {
    await Promise.all(
      serviceProviderNames.map(async (serviceProviderName: string) => {
        const serviceProviderCard: Locator = this.getServiceProviderCard(serviceProviderName);
        await expect(serviceProviderCard).toBeVisible();
        await expect(serviceProviderCard.locator('img')).toBeVisible();
      }),
    );
  }

  public async assertServiceProvidersAreHidden(serviceProviderNames: string[]): Promise<void> {
    for (const serviceProviderName of serviceProviderNames) {
      await expect(this.getServiceProviderCard(serviceProviderName)).toBeHidden();
    }
  }

  public async assertNewsbox(
    textParameters: {
      schulName: string;
      rollenName: string;
      timeLimit: Date;
    },
    expectedColor: 'red' | 'orange',
  ): Promise<void> {
    const expectedText: string = `Hinweis: Die Zuordnung dieses Benutzerkontos zu der Schule "${textParameters.schulName}" mit der Rolle "${textParameters.rollenName}" ist bis zum ${formatDateDMY(textParameters.timeLimit)} befristet. Sollte dies nicht zutreffen, wenden Sie sich bitte an Ihre Schulleitung. Nach Ende der Zuordnung sind Funktionalitäten, die im Bezug zu dieser Schule und Rolle stehen, nicht mehr verfügbar.`;
    await expect(this.page.getByText(expectedText)).toBeVisible();
    if (expectedColor === 'red') {
      await expect(this.page.getByRole('alert')).toHaveCSS('background-color', 'rgb(255, 85, 85)');
    }
    if (expectedColor === 'orange') {
      await expect(this.page.getByRole('alert')).toHaveCSS('background-color', 'rgb(255, 152, 37)');
    }
  }

  private getServiceProviderCard(serviceProviderName: string): Locator {
    return this.page.locator('[data-testid^="service-provider-card"]', { hasText: serviceProviderName });
  }

  private async clickServiceProviderAndWaitForNewPage(
    serviceProviderName: string,
    newPagePromise: Promise<Page>,
    loadState: 'load' | 'domcontentloaded',
  ): Promise<Page> {
    const [newPage] = await Promise.all([newPagePromise, this.getServiceProviderCard(serviceProviderName).click()]);
    await newPage.waitForLoadState(loadState);
    return newPage;
  }
}
