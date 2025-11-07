import { expect, Page } from '@playwright/test';
import { LandingViewPage } from '../LandingView.neu.page';
import { LoginViewPage } from '../LoginView.neu.page';
import { ProfileViewPage } from '../ProfileView.neu.page';

export class HeaderPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}


  // Clearing cookies here to ensure logout works reliably because of observed issues with Playwright still keeping the session ID even after keycloak has deleted the session.
  // Because of that the app shows a keycloak error on login.
  public async logout(): Promise<LandingViewPage> {
    await this.page.getByTestId('nav-logout-button').click();
    
    // Wait for page to finish loading
    await this.page.waitForLoadState('load', { timeout: 15000 });
    
    // Clear any storage/cookies that might be causing issues
    await this.page.context().clearCookies();
    
    // Navigate to root with a clean slate
    await this.page.goto('/', { waitUntil: 'load' });
    
    const landingPage: LandingViewPage = new LandingViewPage(this.page);
    await landingPage.waitForPageLoad();
    return landingPage;
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
    await expect(this.page.getByTestId('profile-icon')).toBeVisible();
    await expect(this.page.getByTestId('logout-icon')).toBeVisible();
  }
}
