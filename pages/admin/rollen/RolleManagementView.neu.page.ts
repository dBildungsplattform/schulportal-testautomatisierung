import { expect, Locator, type Page } from '@playwright/test';
import { RolleDetailsViewPage } from './RolleDetailsView.neu.page';
import { DataTable } from '../../components/DataTable.neu.page';

export class RolleManagementViewPage {
  /* add global locators here */
  private readonly rolleTable: DataTable = new DataTable(this.page, this.page.getByTestId('rolle-table'));

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<RolleManagementViewPage> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Rollenverwaltung');
    await expect(this.page.getByTestId('rolle-table')).not.toContainText('Keine Daten');
    return this;
  }

  public async openGesamtuebersicht(rollenname: string): Promise<RolleDetailsViewPage> {
    await this.rolleTable.getItemByText(rollenname).click();
    return new RolleDetailsViewPage(this.page).waitForPageLoad();
  }

  public async setPageSize(size: '5' | '30' | '50' | '100' | '300'): Promise<void> {
    await this.rolleTable.setItemsPerPage(size);
  }

  /* assertions */
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

    for (const serviceProvider of serviceProviders) {
      await expect(serviceProviderCell).toContainText(serviceProvider);
    }
  }
}
