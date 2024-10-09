import { type Locator, Page } from "@playwright/test";
import { MenuPage } from "./MenuBar.page";
import { LandingPage } from "./LandingView.page";

export class StartPage {
  readonly page: Page;
  readonly text_h2_Ueberschrift: Locator;
  readonly card_item_email: Locator;
  readonly card_item_itslearning: Locator;
  readonly card_item_schulportal_administration: Locator;

  constructor(page) {
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

  public async administration(): Promise<MenuPage> {
    await this.card_item_schulportal_administration.click();
    return new MenuPage(this.page);
  }

  public async start(): Promise<LandingPage> {
    await this.page.goto(process.env.FRONTEND_URL || "/");
    return new LandingPage(this.page);
  }
}