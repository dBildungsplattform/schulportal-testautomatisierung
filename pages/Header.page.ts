import { type Locator, Page } from "@playwright/test";

export class HeaderPage {
  public readonly button_logout: Locator;

  public constructor(public readonly page: Page) {
    this.button_logout = page.getByTestId("nav-logout-button");
  }

  public async logout(): Promise<void> {
    await this.button_logout.click();
  }
}
