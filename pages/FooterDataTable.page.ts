import { type Locator, Page } from "@playwright/test";

export class FooterDataTablePage {
  public readonly combobox_AnzahlEintraege: Locator;

  public constructor(public readonly page: Page) {
    this.combobox_AnzahlEintraege = page.locator(
      ".v-data-table-footer__items-per-page .v-input",
    );
  }
}
