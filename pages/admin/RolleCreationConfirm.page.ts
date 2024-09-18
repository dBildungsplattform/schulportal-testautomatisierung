import { Locator, Page } from "@playwright/test";
import {RolleManagementViewPage} from "./RolleManagementView.page";

export class RolleCreationConfirmPage {
  constructor(private page: Page) {}

  public readonly confirmationMessage: Locator = this.page.getByText(
    "Folgende Daten wurden gespeichert:",
  );
  private readonly button_ZurueckErgebnisliste: Locator = this.page.getByTestId(
    "back-to-list-button",
  );

  public async backToResultList() : Promise<RolleManagementViewPage> {
    await this.button_ZurueckErgebnisliste.click();

    return new RolleManagementViewPage(this.page);
  }
}
