import { type Locator, Page } from "@playwright/test";
import { RolleManagementViewPage } from "./RolleManagementView.page";

export class RolleCreationConfirmPage {
  constructor(private page: Page) {}

  public readonly confirmationMessage: Locator = this.page.getByText(
    "Folgende Daten wurden gespeichert:",
  );
  public readonly text_h2_RolleAnlegen = this.page.getByTestId(
    "layout-card-headline",
  );
  public readonly button_Schliessen = this.page.getByTestId(
    "close-layout-card-button",
  );
  public readonly text_success = this.page.getByTestId("rolle-success-text");
  public readonly icon_success = this.page.locator(".mdi-check-circle");
  public readonly label_Rollenart = this.page.getByText("Rollenart:", {
    exact: true,
  });
  public readonly data_Rollenart = this.page.getByTestId(
    "created-rolle-rollenart",
  );
  public readonly label_Rollenname = this.page.getByText("Rollenname:", {
    exact: true,
  });
  public readonly data_Rollenname = this.page.getByTestId("created-rolle-name");
  public readonly label_Merkmale = this.page.getByText("Merkmale:", {
    exact: true,
  });
  public readonly data_Merkmale = this.page.getByTestId(
    "created-rolle-merkmale",
  );
  public readonly label_Angebote = this.page.getByText(
    "Zugeordnete Angebote:",
    {
      exact: true,
    },
  );
  public readonly data_Angebote = this.page.getByTestId(
    "created-rolle-angebote",
  );
  public readonly label_Systemrechte = this.page.getByText("Systemrechte:", {
    exact: true,
  });
  public readonly data_Systemrechte = this.page.getByTestId(
    "created-rolle-systemrecht",
  );

  public readonly text_DatenGespeichert = this.page.getByText(
    "Folgende Daten wurden gespeichert:",
  );

  public readonly label_Administrationsebene = this.page.getByText(
    "Administrationsebene:",
    {
      exact: true,
    },
  );
  public readonly data_Administrationsebene = this.page.getByTestId(
    "created-rolle-administrationsebene",
  );
  public readonly button_ZurueckErgebnisliste = this.page.getByTestId(
    "back-to-list-button",
  );
  public readonly button_WeitereRolleAnlegen = this.page.getByTestId(
    "create-another-rolle-button",
  );

  public async backToResultList(): Promise<RolleManagementViewPage> {
    await this.button_ZurueckErgebnisliste.click();

    return new RolleManagementViewPage(this.page);
  }
}
