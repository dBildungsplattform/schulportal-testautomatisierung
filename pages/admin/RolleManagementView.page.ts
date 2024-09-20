import { type Locator, Page } from "@playwright/test";

export class RolleManagementViewPage {
  readonly page: Page;
  readonly text_h1_Administrationsbereich: Locator;
  readonly text_h2_Rollenverwaltung: Locator;
  readonly table_header_Rollenname: Locator;
  readonly table_header_Rollenart: Locator;
  readonly table_header_Merkmale: Locator;
  readonly table_header_Administrationsebene: Locator;
  private readonly rolleOverviewTable: Locator;

  constructor(page) {
    this.page = page;
    this.text_h1_Administrationsbereich = page.getByTestId("admin-headline");
    this.text_h2_Rollenverwaltung = page.getByTestId("layout-card-headline");
    this.table_header_Rollenname = page.getByText("Rollenname");
    this.table_header_Rollenart = page.getByText("Rollenart");
    this.table_header_Merkmale = page.getByText("Merkmale");
    this.table_header_Administrationsebene = page.getByText(
      "Administrationsebene",
    );
    this.rolleOverviewTable = page.getByTestId("rolle-table");
  }

  public rowByRoleName(roleName: string) {
    return new RoleTableRow(
      this.rolleOverviewTable.locator(`tr:has-text('${roleName}')`),
    );
  }
}

enum TableCells {
  ServiceProvider = 4,
}

export class RoleTableRow {
  constructor(public readonly locator: Locator) {}

  public spCell() {
    return this.locator.locator("td").nth(TableCells.ServiceProvider);
  }
}
