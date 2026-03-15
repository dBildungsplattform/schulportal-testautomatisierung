import { expect, Page } from '@playwright/test';
import { LoginViewPage } from './LoginView.neu.page';

export class LandingViewPage {
  /* add global locators here */

  constructor(private readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<LandingViewPage> {
    await this.page.getByTestId('landing-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('landing-headline')).toHaveText('Willkommen im Schulportal SH.');
    return this;
  }

  public async navigateToLogin(): Promise<LoginViewPage> {
    await this.page.getByTestId('login-button').click();
    return new LoginViewPage(this.page);
  }

  /* assertions */
}
