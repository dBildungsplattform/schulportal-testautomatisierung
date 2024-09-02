import { type Locator, Page } from "@playwright/test";
import { ComboBox } from "../../elements/ComboBox.js";

export class KlasseCreationViewPage {
  public readonly text_h2_KlasseAnlegen: Locator;
  public readonly button_Schliessen: Locator;
  public readonly combobox_Schulstrukturknoten: Locator;
  public readonly input_Klassenname: Locator;
  public readonly button_KlasseAnlegen: Locator;
  public readonly text_success: Locator;
  public readonly icon_success: Locator;
  public readonly text_DatenGespeichert: Locator;
  public readonly label_Schule: Locator;
  public readonly data_Schule: Locator;
  public readonly label_Klasse: Locator;
  public readonly data_Klasse: Locator;
  public readonly button_ZurueckErgebnisliste: Locator;
  public readonly button_WeitereKlasseAnlegen: Locator;
  public readonly combobox_schulauswahl: ComboBox;

  public constructor(public readonly page: Page) {
    // Anlage Klasse
    this.text_h2_KlasseAnlegen = page.getByTestId("layout-card-headline");
    this.button_Schliessen = page.getByTestId("close-layout-card-button");
    this.combobox_Schulstrukturknoten = page
      .getByTestId("schule-select")
      .locator(".v-input__control");
    this.input_Klassenname = page
      .getByTestId("klassenname-input")
      .locator("input");
    this.button_KlasseAnlegen = page.getByTestId("klasse-form-create-button");
    // Bestätigungsseite Klasse
    this.text_success = page.getByTestId("klasse-success-text");
    this.icon_success = page.locator(".mdi-check-circle");
    this.text_DatenGespeichert = page.getByText(
      "Folgende Daten wurden gespeichert:",
    );
    this.label_Schule = page.getByText("Schule:", { exact: true });
    this.data_Schule = page.getByTestId("created-klasse-schule");
    this.label_Klasse = page.getByText("Klassenname:", { exact: true });
    this.data_Klasse = page.getByTestId("created-klasse-name");
    this.button_ZurueckErgebnisliste = page.getByTestId("back-to-list-button");
    this.button_WeitereKlasseAnlegen = page.getByTestId(
      "create-another-klasse-button",
    );

    this.combobox_schulauswahl = new ComboBox(
      page,
      this.combobox_Schulstrukturknoten,
    );
  }

  public async selectSchule(schulname: string): Promise<void> {
    await this.combobox_schulauswahl.select(schulname);
  }

  public async inputKlassenname(klassenname: string): Promise<void> {
    await this.input_Klassenname.fill(klassenname);
  }

  public async confirmAnlage(): Promise<void> {
    await this.button_KlasseAnlegen.click();
  }

  public async klasseAnlegen(
    schulname: string,
    klassenname: string,
  ): Promise<void> {
    await this.selectSchule(schulname);
    await this.inputKlassenname(klassenname);
    await this.confirmAnlage();
  }
}
