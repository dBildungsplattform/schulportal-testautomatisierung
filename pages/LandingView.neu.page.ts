import { Page } from '@playwright/test';
import { LoginViewPage } from './LoginView.neu.page';

export class LandingViewPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async goToLogin(): Promise<LoginViewPage> {
    await this.page.getByTestId('login-button').click();
    return new LoginViewPage(this.page);
  }

  /* assertions */
}
