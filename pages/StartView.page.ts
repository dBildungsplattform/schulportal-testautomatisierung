import { type Locator, Page } from "@playwright/test";

export class StartPage {
  public readonly text_h2_Ueberschrift: Locator;
  public readonly card_item_email: Locator;
  public readonly card_item_itslearning: Locator;
  public readonly card_item_schulportal_administration: Locator;

  public constructor(public readonly page: Page) {
    this.page = page;
    this.text_h2_Ueberschrift = page.getByTestId("all-service-provider-title");
    this.card_item_email = page
      .locator('[href="https://de.wikipedia.org/wiki/E-Mail"]')
      .first();
    this.card_item_itslearning = page.locator(
      '[href="https://sh-staging.itslintegrations.com/"]',
    );
    this.card_item_schulportal_administration = page.getByText(
      "Schulportal-Administration",
    );
  }

  public async administration(): Promise<void> {
    await this.card_item_schulportal_administration.click();
  }
}
