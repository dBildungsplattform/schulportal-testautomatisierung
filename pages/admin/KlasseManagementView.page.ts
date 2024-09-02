import { type Locator, Page } from "@playwright/test";

export class KlasseManagementViewPage {
  public readonly text_h1_Administrationsbereich: Locator;
  public readonly text_h2_Klassenverwaltung: Locator;
  public readonly combobox_Filter_Schule: Locator;
  public readonly combobox_Filter_Klasse: Locator;
  public readonly table_header_Dienststellennummer: Locator;
  public readonly table_header_Klassenname: Locator;
  public readonly icon_KlasseLoeschen: Locator;
  public readonly button_KlasseLoeschen: Locator;
  public readonly button_SchliesseKlasseLoeschenDialog: Locator;

  public constructor(public readonly page: Page) {
    this.text_h1_Administrationsbereich = page.getByTestId("admin-headline");
    this.text_h2_Klassenverwaltung = page.getByTestId("layout-card-headline");
    this.combobox_Filter_Schule = page.getByPlaceholder("Schule");
    this.combobox_Filter_Klasse = page.getByPlaceholder("Klasse");
    this.table_header_Dienststellennummer = page.getByText(
      "Dienststellennummer",
    );
    this.table_header_Klassenname = page
      .getByTestId("klasse-table")
      .getByText("Klasse", { exact: true });
    this.icon_KlasseLoeschen = page.getByTestId(
      "open-klasse-delete-dialog-icon",
    );
    this.button_KlasseLoeschen = page.getByTestId("klasse-delete-button");
    this.button_SchliesseKlasseLoeschenDialog = page.getByTestId(
      "close-klasse-delete-success-dialog-button",
    );
  }
}
