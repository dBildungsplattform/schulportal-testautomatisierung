import { expect, type Locator, Page } from '@playwright/test';
import { RolleDetailsViewPage } from './RolleDetailsView.page';

export class RolleManagementViewPage {
  readonly page: Page;
  readonly textH1Administrationsbereich: Locator;
  readonly textH2Rollenverwaltung: Locator;
  readonly tableHeaderRollenname: Locator;
  readonly tableHeaderRollenart: Locator;
  readonly tableHeaderMerkmale: Locator;
  readonly tableHeaderAdministrationsebene: Locator;
  private readonly rolleOverviewTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textH1Administrationsbereich = page.getByTestId('admin-headline');
    this.textH2Rollenverwaltung = page.getByTestId('layout-card-headline');
    this.tableHeaderRollenname = page.getByText('Rollenname');
    this.tableHeaderRollenart = page.getByText('Rollenart');
    this.tableHeaderMerkmale = page.getByText('Merkmale');
    this.tableHeaderAdministrationsebene = page.getByText('Administrationsebene');
    this.rolleOverviewTable = page.getByTestId('rolle-table');
  }

  public rowByRoleName(roleName: string): RoleTableRow {
    return new RoleTableRow(this.rolleOverviewTable.locator(`tr:has-text('${roleName}')`));
  }

  public async rolleBearbeiten(roleName: string): Promise<RolleDetailsViewPage> {
    await expect(this.page.getByText('Keine Daten')).not.toBeAttached();
    this.rowByRoleName(roleName).locator.click();
    return new RolleDetailsViewPage(this.page);
  }
}

enum TableCells {
  ServiceProvider = 4,
}

export class RoleTableRow {
  constructor(public readonly locator: Locator) {}

  public spCell() {
    return this.locator.locator('td').nth(TableCells.ServiceProvider);
  }
}
