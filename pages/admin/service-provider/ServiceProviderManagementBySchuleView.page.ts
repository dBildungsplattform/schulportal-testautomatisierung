import { expect, Page, type Response } from '@playwright/test';
import { Autocomplete } from '../../components/Autocomplete';
import { ServiceProviderDetailsBySchuleViewPage } from './ServiceProviderDetailsBySchuleView.page';

interface SchuleSelection {
  id: string;
  name: string;
}

export class ServiceProviderManagementBySchuleViewPage {
  constructor(protected readonly page: Page) {}

  private async waitForResultTableLoad(): Promise<void> {
    await expect(this.page.getByTestId('result-table')).not.toContainText('Daten werden abgerufen...');
  }

  public async waitForPageLoad(): Promise<ServiceProviderManagementBySchuleViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/angebote\/schulspezifisch(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('reset-filter-button')).toBeVisible();
    return this;
  }

  public async filterBySchule(schule: SchuleSelection): Promise<void> {
    const schuleAutocomplete: Autocomplete = new Autocomplete(
      this.page,
      this.page.getByTestId('service-provider-management-by-schule-organisation-select'),
    );
    const organisationResponse: Promise<Response> = this.page.waitForResponse((response: Response): boolean => {
      const responseUrl: URL = new URL(response.url());
      return (
        response.request().method() === 'GET' &&
        responseUrl.pathname === `/api/organisationen/${encodeURIComponent(schule.id)}` &&
        response.ok()
      );
    });

    await schuleAutocomplete.searchByTitle(schule.name);
    await organisationResponse;
    await this.waitForResultTableLoad();
    await expect(this.page.getByTestId('layout-card-headline')).toContainText(schule.name);
  }

  public async openServiceProviderByName(
    angebotName: string,
    expectedOrganisationId?: string,
  ): Promise<ServiceProviderDetailsBySchuleViewPage> {
    const row = this.page.locator('tr').filter({ hasText: angebotName });
    await expect(row).toHaveCount(1);
    await expect(row).toBeVisible();
    await row.click();

    await expect(this.page).toHaveURL((url: URL): boolean => {
      const organisationId: string | null = url.searchParams.get('orga');
      return (
        /^\/admin\/angebote\/schulspezifisch\/[^/]+$/.test(url.pathname) &&
        organisationId !== null &&
        (!expectedOrganisationId || organisationId === expectedOrganisationId)
      );
    });

    const detailsViewPage: ServiceProviderDetailsBySchuleViewPage = new ServiceProviderDetailsBySchuleViewPage(this.page);
    await detailsViewPage.waitForPageLoad();
    return detailsViewPage;
  }

  public async openServiceProviderDetails(
    angebotName: string,
    schule?: SchuleSelection,
  ): Promise<ServiceProviderDetailsBySchuleViewPage> {
    if (schule) {
      await this.filterBySchule(schule);
    }

    const detailsViewPage: ServiceProviderDetailsBySchuleViewPage = await this.openServiceProviderByName(
      angebotName,
      schule?.id,
    );
    await detailsViewPage.assertRollenerweiterungBearbeitenVisible();
    return detailsViewPage;
  }
}
