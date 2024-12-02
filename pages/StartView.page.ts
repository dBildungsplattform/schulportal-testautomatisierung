import { type Locator, Page } from "@playwright/test";
import { MenuPage } from "./MenuBar.page";
import { LandingPage } from "./LandingView.page";

export class StartPage {
  readonly page: Page;
  readonly text_h2_Ueberschrift: Locator;
  readonly card_item_email: Locator;
  readonly card_item_kalender: Locator;
  readonly card_item_adressbuch: Locator;
  readonly card_item_itslearning: Locator;
  readonly card_item_schulportal_administration: Locator;

  constructor(page) {
    this.page = page;
    this.text_h2_Ueberschrift = page.getByTestId("all-service-provider-title");
    this.card_item_email = page.locator('[data-testid^="service-provider-card"]', { hasText: "E-Mail" });
    this.card_item_kalender = page.locator('[data-testid^="service-provider-card"]', { hasText: "Kalender" });
    this.card_item_adressbuch = page.locator('[data-testid^="service-provider-card"]', { hasText: "Adressbuch" });
    this.card_item_itslearning = page.locator('[data-testid^="service-provider-card"]', { hasText: "itslearning" });
    this.card_item_schulportal_administration = page.locator('[data-testid^="service-provider-card"]', { hasText: "Schulportal-Administration" });
  }

  public async goToAdministration(): Promise<MenuPage> {
    await this.card_item_schulportal_administration.click();
    return new MenuPage(this.page);
  }

  public async start(): Promise<LandingPage> {
    await this.page.goto(process.env.FRONTEND_URL || "/");
    return new LandingPage(this.page);
  }
}
