import { type Locator, Page } from "@playwright/test";

export class PersonManagementViewPage {
  public readonly text_h1_Administrationsbereich: Locator;
  public readonly text_h2_Benutzerverwaltung: Locator;
  public readonly input_Suchfeld: Locator;
  public readonly button_Suchen: Locator;
  public readonly table_header_Nachname: Locator;
  public readonly table_header_Vorname: Locator;
  public readonly table_header_Benutzername: Locator;
  public readonly table_header_KopersNr: Locator;
  public readonly table_header_Rolle: Locator;
  public readonly table_header_Zuordnungen: Locator;
  public readonly table_header_Klasse: Locator;

  public constructor(public readonly page: Page) {
    this.text_h1_Administrationsbereich = page.getByTestId("admin-headline");
    this.text_h2_Benutzerverwaltung = page.getByTestId("layout-card-headline");
    this.input_Suchfeld = page.locator(
      '[data-testid="search-filter-input"] input',
    );
    this.button_Suchen = page.getByTestId("apply-search-filter-button");
    this.table_header_Nachname = page
      .getByTestId("person-table")
      .getByText("Nachname", { exact: true });
    this.table_header_Vorname = page
      .getByTestId("person-table")
      .getByText("Vorname", { exact: true });
    this.table_header_Benutzername = page.getByText("Benutzername", {
      exact: true,
    });
    this.table_header_KopersNr = page.getByText("KoPers.-Nr.");
    this.table_header_Rolle = page
      .getByTestId("person-table")
      .getByText("Rolle", { exact: true });
    this.table_header_Zuordnungen = page.getByText("Zuordnung(en)");
    this.table_header_Klasse = page
      .getByTestId("person-table")
      .getByText("Klasse", { exact: true });
  }
}
