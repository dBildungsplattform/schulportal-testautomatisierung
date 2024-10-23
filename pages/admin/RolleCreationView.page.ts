import { type Locator, Page } from "@playwright/test";
import { RolleCreationConfirmPage } from "./RolleCreationConfirm.page";
import { ComboBox } from "../../elements/ComboBox";
import { MenuPage } from "../MenuBar.page";

export class RolleCreationViewPage {
  readonly text_h2_RolleAnlegen: Locator;
  readonly button_Schliessen: Locator;
  readonly combobox_Schulstrukturknoten = this.page
    .getByTestId("administrationsebene-select")
    .locator(".v-input__control");
  readonly combobox_Rollenart = this.page
    .getByTestId("rollenart-select")
    .locator(".v-input__control");
  readonly input_Rollenname: Locator;
  private readonly combobox_Merkmal = this.page
    .getByTestId("merkmale-select")
    .locator(".v-input__control");
  private readonly combobox_Angebote = this.page
    .getByTestId("service-provider-select")
    .locator(".v-input__control");
  private readonly combobox_Systemrechte = this.page
    .getByTestId("systemrechte-select")
    .locator(".v-input__control");
  readonly button_RolleAnlegen: Locator;
  readonly button_WeitereRolleAnlegen: Locator;
  readonly button_ZurueckErgebnisliste: Locator;
  readonly text_success: Locator;
  readonly icon_success: Locator;
  readonly text_DatenGespeichert: Locator;
  readonly label_Administrationsebene: Locator;
  readonly data_Administrationsebene: Locator;
  readonly label_Rollenart: Locator;
  readonly data_Rollenart: Locator;
  readonly label_Rollenname: Locator;
  readonly data_Rollenname: Locator;
  readonly label_Merkmale: Locator;
  readonly data_Merkmale: Locator;
  readonly label_Angebote: Locator;
  readonly data_Angebote: Locator;
  readonly label_Systemrechte: Locator;
  readonly data_Systemrechte: Locator;

  public readonly angebote: ComboBox;
  public readonly merkmale: ComboBox;
  public readonly schulstrukturknoten: ComboBox;
  public readonly rollenarten: ComboBox;
  public readonly systemrechte: ComboBox;

  constructor(public readonly page: Page) {
    // Anlage Rolle
    this.text_h2_RolleAnlegen = page.getByTestId("layout-card-headline");
    this.button_Schliessen = page.getByTestId("close-layout-card-button");
    this.input_Rollenname = page
      .getByTestId("rollenname-input")
      .locator("input");
    this.button_RolleAnlegen = page.getByTestId("rolle-form-submit-button");
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

    this.angebote = new ComboBox(this.page, this.combobox_Angebote);
    this.merkmale = new ComboBox(this.page, this.combobox_Merkmal);
    this.schulstrukturknoten = new ComboBox(
      this.page,
      this.combobox_Schulstrukturknoten,
    );
    this.rollenarten = new ComboBox(this.page, this.combobox_Rollenart);
    this.systemrechte = new ComboBox(this.page, this.combobox_Systemrechte)
  }

  public async enterRollenname(name: string) {
    await this.input_Rollenname.fill(name);
  }

  public async createRolle(): Promise<RolleCreationConfirmPage> {
    await this.button_RolleAnlegen.click();
    return new RolleCreationConfirmPage(this.page);
  }

  public menu(): MenuPage {
    return new MenuPage(this.page);
  }
}
