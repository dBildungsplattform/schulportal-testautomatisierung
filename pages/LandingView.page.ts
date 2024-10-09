import { type Locator, Page } from "@playwright/test";
import { LoginPage } from "./LoginView.page";

export class LandingPage {
  readonly page: Page;
  readonly text_Willkommen: Locator;
  readonly button_Anmelden: Locator;

  constructor(page) {
    this.page = page;
    this.text_Willkommen = page.getByTestId("landing-headline");
    this.button_Anmelden = page.getByTestId("login-button");
  }

  public async login(): Promise<LoginPage> {
    await this.button_Anmelden.click();
    return new LoginPage(this.page);
  }
}
