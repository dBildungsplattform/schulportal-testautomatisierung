import { expect, Locator, type Page } from '@playwright/test';
import { RolleDetailsViewPage } from './RolleDetailsView.page';
import { DataTable } from '../../components/DataTable.neu.page';

export class RolleManagementViewPage {
  /* globale Lokatoren */
  private readonly rolleTable: DataTable = new DataTable(this.page, this.page.getByTestId('rolle-table'));

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<RolleManagementViewPage> {
    await expect(this.page.getByTestId('rolle-management-headline')).toHaveText('Rollenverwaltung');
    await this.rolleTable.waitForPageLoad();
    return this;
  }

  public async openGesamtuebersicht(rollenname: string): Promise<RolleDetailsViewPage> {
    await this.rolleTable.getItemByText(rollenname).click();
    return new RolleDetailsViewPage(this.page).waitForPageLoad();
  }

  public async setPageSize(size: 5 | 30 | 50 | 100 | 300): Promise<void> {
    await this.rolleTable.setItemsPerPage(size);
  }

  /* assertions */
  public async checkManagementPage(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('rolle-management-headline')).toHaveText('Rollenverwaltung');
    await this.checkHeaders(['Rollenname', 'Rollenart', 'Merkmale', 'Angebote', 'Administrationsebene']);
  }
  
  public async checkHeaders(expectedHeaders: string[]): Promise<void> {
    await this.rolleTable.checkHeaders(expectedHeaders);
  }
  public async checkIfRolleExists(rollenname: string): Promise<void> {
    await this.rolleTable.checkIfItemIsVisible(rollenname);
  }

  public async checkIfRolleDoesNotExist(rollenname: string): Promise<void> {
    await this.rolleTable.checkIfItemIsNotVisible(rollenname);
  }

  public async checkIfRolleHasServiceProviders(rollenname: string, serviceProviders: string[]): Promise<void> {
    const serviceProviderCell: Locator = this.rolleTable.tableLocator
      .locator(`tr:has-text("${rollenname}")`)
      .locator('td')
      .nth(4);

    await Promise.all(serviceProviders.map((provider: string) => expect(serviceProviderCell).toContainText(provider)));
  }
}
