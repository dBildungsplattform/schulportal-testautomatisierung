import { type Locator, Page } from "@playwright/test";

export class RolleManagementViewPage {
  public readonly text_h1_Administrationsbereich: Locator;
  public readonly text_h2_Rollenverwaltung: Locator;
  public readonly table_header_Rollenname: Locator;
  public readonly table_header_Rollenart: Locator;
  public readonly table_header_Merkmale: Locator;
  public readonly table_header_Administrationsebene: Locator;

  public constructor(public readonly page: Page) {
    this.text_h1_Administrationsbereich = page.getByTestId("admin-headline");
    this.text_h2_Rollenverwaltung = page.getByTestId("layout-card-headline");
    this.table_header_Rollenname = page.getByText("Rollenname");
    this.table_header_Rollenart = page.getByText("Rollenart");
    this.table_header_Merkmale = page.getByText("Merkmale");
    this.table_header_Administrationsebene = page.getByText(
      "Administrationsebene",
    );
  }
}
