import { type Locator, Page } from "@playwright/test";
import { ComboBox } from "../../elements/ComboBox.js";

export class RolleCreationViewPage {
  public readonly text_h2_RolleAnlegen: Locator;
  public readonly button_Schliessen: Locator;
  public readonly combobox_Schulstrukturknoten: Locator;
  public readonly combobox_Rollenart: Locator;
  public readonly input_Rollenname: Locator;
  public readonly combobox_Merkmal: Locator;
  public readonly combobox_Angebote: Locator;
  public readonly combobox_Systemrechte: Locator;
  public readonly button_RolleAnlegen: Locator;
  public readonly button_WeitereRolleAnlegen: Locator;
  public readonly button_ZurueckErgebnisliste: Locator;
  public readonly text_success: Locator;
  public readonly icon_success: Locator;
  public readonly text_DatenGespeichert: Locator;
  public readonly label_Administrationsebene: Locator;
  public readonly data_Administrationsebene: Locator;
  public readonly label_Rollenart: Locator;
  public readonly data_Rollenart: Locator;
  public readonly label_Rollenname: Locator;
  public readonly data_Rollenname: Locator;
  public readonly label_Merkmale: Locator;
  public readonly data_Merkmale: Locator;
  public readonly label_Angebote: Locator;
  public readonly data_Angebote: Locator;
  public readonly label_Systemrechte: Locator;
  public readonly data_Systemrechte: Locator;
  public readonly schulstrukturknotenComboBox: ComboBox;

  public constructor(public readonly page: Page) {
    // Anlage Rolle
    this.text_h2_RolleAnlegen = page.getByTestId("layout-card-headline");
    this.button_Schliessen = page.getByTestId("close-layout-card-button");
    this.combobox_Schulstrukturknoten = page
      .getByTestId("administrationsebene-select")
      .locator(".v-input__control");
    this.combobox_Rollenart = page
      .getByTestId("rollenart-select")
      .locator(".v-input__control");
    this.input_Rollenname = page
      .getByTestId("rollenname-input")
      .locator("input");
    this.combobox_Merkmal = page
      .getByTestId("merkmale-select")
      .locator(".v-input__control");
    this.combobox_Angebote = page
      .getByTestId("service-provider-select")
      .locator(".v-input__control");
    this.combobox_Systemrechte = page
      .getByTestId("systemrechte-select")
      .locator(".v-input__control");
    this.button_RolleAnlegen = page.getByTestId("rolle-form-create-button");
    this.button_WeitereRolleAnlegen = page.getByTestId(
      "create-another-rolle-button",
    );
    // Bestätigungsseite Rolle
    this.button_ZurueckErgebnisliste = page.getByTestId("back-to-list-button");
    this.text_success = page.getByTestId("rolle-success-text");
    this.icon_success = page.locator(".mdi-check-circle");
    this.text_DatenGespeichert = page.getByText(
      "Folgende Daten wurden gespeichert:",
    );
    this.label_Administrationsebene = page.getByText("Administrationsebene:", {
      exact: true,
    });
    this.data_Administrationsebene = page.getByTestId(
      "created-rolle-administrationsebene",
    );
    this.label_Rollenart = page.getByText("Rollenart:", { exact: true });
    this.data_Rollenart = page.getByTestId("created-rolle-rollenart");
    this.label_Rollenname = page.getByText("Rollenname:", { exact: true });
    this.data_Rollenname = page.getByTestId("created-rolle-name");
    this.label_Merkmale = page.getByText("Merkmale:", { exact: true });
    this.data_Merkmale = page.getByTestId("created-rolle-merkmale");
    this.label_Angebote = page.getByText("Zugeordnete Angebote:", {
      exact: true,
    });
    this.data_Angebote = page.getByTestId("created-rolle-angebote");
    this.label_Systemrechte = page.getByText("Systemrechte:", { exact: true });
    this.data_Systemrechte = page.getByTestId("created-rolle-systemrecht");

    this.schulstrukturknotenComboBox = new ComboBox(
      this.page,
      this.combobox_Schulstrukturknoten,
    );
  }

  public async selectSchulstrukturknoten(
    schulstrukturknoten: string,
  ): Promise<void> {
    await this.schulstrukturknotenComboBox.select(schulstrukturknoten);
  }
}
