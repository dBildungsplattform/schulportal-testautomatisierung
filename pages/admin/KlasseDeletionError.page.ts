import { Page } from "@playwright/test";
import { KlasseManagementViewPage } from './KlasseManagementView.page';

export class KlasseDeletionErrorPage {
  constructor(private page: Page) {}

  public readonly text_title_error = this.page.getByTestId(
    "alert-title",
  );

  public readonly text_message_error = this.page.getByTestId(
    "alert-text",
  );

  public readonly icon_failure = this.page.locator(".mdi-close-circle");

  public readonly button_ZurueckErgebnisliste = this.page.getByTestId(
    "back-to-list-button",
  );

  public async backToResultList(): Promise<KlasseManagementViewPage> {
    await this.button_ZurueckErgebnisliste.click();

    return new KlasseManagementViewPage(this.page);
  }
}
