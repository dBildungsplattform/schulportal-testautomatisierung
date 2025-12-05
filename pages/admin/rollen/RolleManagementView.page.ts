import { expect, Locator, type Page } from '@playwright/test';
import { RolleDetailsViewPage } from './RolleDetailsView.page';
import { DataTable } from '../../components/DataTable.neu.page';

export class RolleManagementViewPage {
  /* globale Lokatoren */
  private readonly headline: Locator = this.page.getByTestId('rolle-management-headline');
  private readonly cardHeadline: Locator = this.page.getByTestId('layout-card-headline');
  private readonly rolleTableLocator: Locator = this.page.getByTestId('rolle-table');
  private readonly tableRows: Locator = this.rolleTableLocator.locator('tbody .v-data-table__tr');
  private readonly tableCheckboxes: Locator = this.rolleTableLocator.locator('tbody .v-data-table__td--select-row input[type="checkbox"]');
  private readonly tableCells: Locator = this.rolleTableLocator.locator('tbody .v-data-table__td');
  private readonly paginationFirst: Locator = this.page.locator('[data-test="v-pagination-first"]');
  private readonly paginationPrev: Locator = this.page.locator('[data-test="v-pagination-prev"]');
  private readonly paginationItem: Locator = this.page.locator('[data-test="v-pagination-item"]');
  private readonly paginationNext: Locator = this.page.locator('[data-test="v-pagination-next"]');
  private readonly paginationLast: Locator = this.page.locator('[data-test="v-pagination-last"]');
  private readonly itemsPerPage: Locator = this.page.locator('.v-data-table-footer__items-per-page');
  private readonly sortHeaders: Locator = this.rolleTableLocator.locator('thead .v-data-table__th--sortable');

  private readonly rolleTable: DataTable = new DataTable(this.page, this.rolleTableLocator);

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<RolleManagementViewPage> {
    await expect(this.headline).toHaveText('Rollenverwaltung');
    await expect(this.rolleTableLocator).not.toContainText('Keine Daten');
    return this;
  }

  public async openGesamtuebersicht(rollenname: string): Promise<RolleDetailsViewPage> {
    await this.rolleTableLocator.locator(`tr:has-text("${rollenname}")`).click();
    return new RolleDetailsViewPage(this.page).waitForPageLoad();
  }

  public async setPageSize(size: '5' | '30' | '50' | '100' | '300'): Promise<void> {
    await this.rolleTable.setItemsPerPageNew(size);
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

    await expect(serviceProviderCell).toContainText(serviceProviders);
  }
}
