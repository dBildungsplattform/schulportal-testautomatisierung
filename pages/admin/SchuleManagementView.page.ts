import { type Locator, Page } from "@playwright/test";

export class SchuleManagementViewPage {
  public readonly text_h1_Administrationsbereich: Locator;
  public readonly text_h2_Schulverwaltung: Locator;
  public readonly table_header_Dienststellennummer: Locator;
  public readonly table_header_Schulname: Locator;

  public constructor(public readonly page: Page) {
    this.text_h1_Administrationsbereich = page.getByTestId("admin-headline");
    this.text_h2_Schulverwaltung = page.getByTestId("layout-card-headline");
    this.table_header_Dienststellennummer = page.getByText(
      "Dienststellennummer",
    );
    this.table_header_Schulname = page.getByText("Schulname");
  }
}
