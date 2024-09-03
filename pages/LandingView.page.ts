import { expect, type Locator, Page } from "@playwright/test";

const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

export class LandingPage {
  public readonly text_Willkommen: Locator;
  public readonly button_Anmelden: Locator;

  public constructor(
    private readonly page: Page,
    private readonly url: string = FRONTEND_URL,
  ) {
    this.text_Willkommen = page.getByTestId("landing-headline");
    this.button_Anmelden = page.getByTestId("login-button");
  }

  public async goto(): Promise<void> {
    await this.page.goto(this.url);
    await expect(this.text_Willkommen).toBeVisible();
  }

  public async login(): Promise<void> {
    await this.goto();
    await this.button_Anmelden.click();
  }

  public async klasseAnlegen(): Promise<void> {
    this.page.goto(FRONTEND_URL + "admin/klassen/new");
  }
}
