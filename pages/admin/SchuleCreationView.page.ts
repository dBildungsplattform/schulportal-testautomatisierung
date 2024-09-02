import { type Locator, Page } from "@playwright/test";

export class SchuleCreationViewPage {
  public readonly text_h2_SchuleAnlegen: Locator;
  public readonly button_Schliessen: Locator;
  public readonly radio_button_Public_Schule: Locator;
  public readonly radio_button_Ersatzschule: Locator;
  public readonly input_Dienststellennummer: Locator;
  public readonly input_Schulname: Locator;
  public readonly button_SchuleAnlegen: Locator;
  public readonly button_WeitereSchuleAnlegen: Locator;
  public readonly button_ZurueckErgebnisliste: Locator;
  public readonly text_success: Locator;
  public readonly icon_success: Locator;
  public readonly text_DatenGespeichert: Locator;
  public readonly label_Schulform: Locator;
  public readonly data_Schulform: Locator;
  public readonly label_Dienststellennummer: Locator;
  public readonly data_Dienststellennummer: Locator;
  public readonly label_Schulname: Locator;
  public readonly data_Schulname: Locator;

  public constructor(public readonly page: Page) {
    // Anlage Schule
    this.text_h2_SchuleAnlegen = page.getByTestId("layout-card-headline");
    this.button_Schliessen = page.getByTestId("close-layout-card-button");
    this.radio_button_Public_Schule = page.getByTestId(
      "public-schule-radio-button",
    );
    this.radio_button_Ersatzschule = page.getByTestId(
      "ersatzschule-radio-button",
    );
    this.input_Dienststellennummer = page
      .getByTestId("dienststellennummer-input")
      .locator("input");
    this.input_Schulname = page.getByTestId("schulname-input").locator("input");
    this.button_SchuleAnlegen = page.getByTestId(
      "schule-creation-form-create-button",
    );
    this.button_WeitereSchuleAnlegen = page.getByTestId(
      "create-another-schule-button",
    );
    // Bestätigungsseite
    this.button_ZurueckErgebnisliste = page.getByTestId("back-to-list-button");
    this.text_success = page.getByTestId("schule-success-text");
    this.icon_success = page.locator(".mdi-check-circle");
    this.text_DatenGespeichert = page.getByText(
      "Folgende Daten wurden gespeichert:",
    );
    this.label_Schulform = page.getByText("Schulform:", { exact: true });
    this.data_Schulform = page.getByTestId("created-schule-form");
    this.label_Dienststellennummer = page.getByText("Dienststellennummer:", {
      exact: true,
    });
    this.data_Dienststellennummer = page.getByTestId(
      "created-schule-dienststellennummer",
    );
    this.label_Schulname = page.getByText("Schulname:", { exact: true });
    this.data_Schulname = page.getByTestId("created-schule-name");
  }
}
