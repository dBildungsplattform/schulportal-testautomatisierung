import { expect, Page } from '@playwright/test';
import { LoginViewPage } from './LoginView.neu.page';

export class LandingViewPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('landing-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('landing-headline')).toHaveText('Willkommen im Schulportal SH.');
  }

  public async navigateToLogin(): Promise<LoginViewPage> {
    await this.page.getByTestId('login-button').click();
    return new LoginViewPage(this.page);
  }

  /* assertions */
}
