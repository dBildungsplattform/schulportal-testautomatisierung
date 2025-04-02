import { type Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginView.page';

export class LandingPage {
  readonly page: Page;
  readonly textWillkommen: Locator;
  readonly buttonAnmelden: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textWillkommen = page.getByTestId("landing-headline");
    this.buttonAnmelden = page.getByTestId("login-button");
  }

  public async goToLogin(): Promise<LoginPage> {
    await this.buttonAnmelden.click();
    return new LoginPage(this.page);
  }
}
