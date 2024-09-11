import { type Locator, Page } from "@playwright/test";
import { ComboBox } from "../../elements/ComboBox.js";

export class PersonCreationViewPage {
  public readonly body: Locator;
  public readonly text_h2_PersonAnlegen: Locator;
  public readonly button_Schliessen: Locator;
  private readonly combobox_Rolle: ComboBox;
  public readonly combobox_Rolle_Clear: Locator;
  public readonly Input_Vorname: Locator;
  public readonly Input_Nachname: Locator;
  public readonly Input_Kopersnr: Locator;
  private readonly combobox_Schulstrukturknoten: ComboBox;
  public readonly combobox_Schulstrukturknoten_Clear: Locator;
  private readonly combobox_Klasse: ComboBox;
  public readonly button_PersonAnlegen: Locator;
  public readonly text_success: Locator;
  public readonly icon_success: Locator;
  public readonly text_DatenGespeichert: Locator;
  public readonly input_EinstiegsPasswort: Locator;
  public readonly label_EinstiegsPasswort: Locator;
  public readonly button_ZurueckErgebnisliste: Locator;
  public readonly button_WeiterenBenutzerAnlegen: Locator;
  public readonly label_Vorname: Locator;
  public readonly data_Vorname: Locator;
  public readonly label_Nachname: Locator;
  public readonly data_Nachname: Locator;
  public readonly label_Benutzername: Locator;
  public readonly data_Benutzername: Locator;
  public readonly label_Rolle: Locator;
  public readonly data_Rolle: Locator;
  public readonly label_Organisationsebene: Locator;
  public readonly data_Organisationsebene: Locator;
  public readonly label_Klasse: Locator;
  public readonly data_Klasse: Locator;

  public constructor(public readonly page: Page) {
    // Anlage Person
    this.body = page.locator("body");
    this.text_h2_PersonAnlegen = page.getByTestId("layout-card-headline");
    this.button_Schliessen = page.getByTestId("close-layout-card-button");
    this.combobox_Rolle = new ComboBox(
      page,
      page.getByTestId("rolle-select").locator(".v-field__input"),
    );
    this.combobox_Rolle_Clear = page
      .getByTestId("rolle-select")
      .getByLabel("leeren");
    this.combobox_Schulstrukturknoten_Clear = page
      .getByTestId("organisation-select")
      .getByLabel("leeren");
    this.Input_Vorname = page
      .getByTestId("vorname-input")
      .locator(".v-field__input");
    this.Input_Nachname = page
      .getByTestId("familienname-input")
      .locator(".v-field__input");
    this.Input_Kopersnr = page
      .getByTestId("kopersnr-input")
      .locator(".v-field__input");
    this.combobox_Schulstrukturknoten = new ComboBox(
      page,
      page.getByTestId("organisation-select").locator(".v-field__input"),
    );
    this.combobox_Klasse = new ComboBox(
      page,
      page.getByTestId("klasse-select").locator(".v-field__input"),
    );
    this.button_PersonAnlegen = page.getByTestId(
      "person-creation-form-create-button",
    );
    // Bestätigungsseite Klasse
    this.text_success = page.getByTestId("person-success-text");
    this.icon_success = page.locator(".mdi-check-circle");
    this.text_DatenGespeichert = page.getByText(
      "Folgende Daten wurden gespeichert:",
    );
    this.label_Vorname = page.getByText("Vorname:", { exact: true });
    this.data_Vorname = page.getByTestId("created-person-vorname");
    this.label_Nachname = page.getByText("Nachname:", { exact: true });
    this.data_Nachname = page.getByTestId("created-person-familienname");
    this.label_Benutzername = page.getByText("Benutzername:", { exact: true });
    this.data_Benutzername = page.getByTestId("created-person-username");
    this.label_Rolle = page.getByText("Rolle:", { exact: true });
    this.data_Rolle = page.getByTestId("created-person-rolle");
    this.label_Organisationsebene = page.getByText("Organisationsebene:", {
      exact: true,
    });
    this.data_Organisationsebene = page.getByTestId(
      "created-person-organisation",
    );
    this.label_Klasse = page.getByText("Klasse:", { exact: true });
    this.data_Klasse = page.getByTestId("created-person-klasse");
    this.label_EinstiegsPasswort = page.getByText(" Einstiegs-Passwort:", {
      exact: true,
    });
    this.input_EinstiegsPasswort = page.locator(
      '[data-testid="password-output-field"] input',
    );
    this.button_ZurueckErgebnisliste = page.getByTestId("back-to-list-button");
    this.button_WeiterenBenutzerAnlegen = page.getByTestId(
      "create-another-person-button",
    );
  }

  public async selectSchulstrukturknoten(value: string): Promise<void> {
    await this.combobox_Schulstrukturknoten.select(value);
  }

  public async selectRolle(value: string): Promise<void> {
    await this.combobox_Rolle.select(value);
  }

  public async selectKlasse(value: string): Promise<void> {
    await this.combobox_Klasse.select(value);
  }

  public async showRollenAvailable(): Promise<void> {
    await this.combobox_Rolle.open();
  }
}
