import { Page } from '@playwright/test';
import { LandingViewPage } from '../LandingView.neu.page';
import { LoginViewPage } from '../LoginView.neu.page';
import { ProfileViewPage } from '../ProfileView.neu.page';

export class HeaderPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  /* actions */
  public async logout(): Promise<LandingViewPage> {
    await this.page.getByTestId('nav-logout-button').click();
    // TODO: this hopefully redirects to landing, even if we get 'stuck' on keycloak login, because of trailing requests during logout
    await this.page.goto('/');
    return new LandingViewPage(this.page);
  }

  public async navigateToLogin(): Promise<LoginViewPage> {
    await this.page.getByTestId('nav-login-button').click();
    return new LoginViewPage(this.page);
  }

  public async navigateToProfile(): Promise<ProfileViewPage> {
    await this.page.getByTestId('nav-profile-button').click();
    return new ProfileViewPage(this.page);
  }

  /* assertions */
  public async checkIfIconsAreVisible(): Promise<void> {
    await this.page.locator('.mdi-account-outline').isVisible();
    await this.page.locator('.mdi-logout').isVisible();
  }
}
