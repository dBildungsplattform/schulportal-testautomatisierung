import { type Locator, Page, expect } from '@playwright/test';
import { LandingPage } from './LandingView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { LoginPage } from '../pages/LoginView.page';
import { ProfilePage } from './ProfileView.page';
import { StartPage } from './StartView.page';

export class HeaderPage {
  readonly page: Page;
  readonly button_login: Locator;
  readonly button_logout: Locator;
  readonly button_profil: Locator;
  readonly icon_myProfil: Locator;
  readonly icon_logout: Locator;

  constructor(page) {
    this.page = page;
    this.button_login = page.getByTestId('nav-login-button');
    this.button_logout = page.getByTestId('nav-logout-button');
    this.button_profil = page.getByTestId('nav-profile-button');
    this.icon_myProfil = page.locator('.mdi-account-outline');
    this.icon_logout = page.locator('.mdi-logout');
  }

  async logout({ logoutViaStartPage }: { logoutViaStartPage: boolean }): Promise<LandingPage> {
    // During the logout process there are still running requests from the tests.
    // Therefor we have a workaround. Every logout will go through the start page. --> This is deprecated!
    // New tests are responsible that the last request in the test is finished before the test ends.
    // The other tests must be fixed gradually
    if (logoutViaStartPage) {
      await FromAnywhere(this.page).start();
      const startPage: StartPage = new StartPage(this.page);
      await startPage.validateStartPageIsLoaded();
      console.log('Deprecated, logout via start page');
    }

    await this.button_logout.click();
    const landingPage: LandingPage = new LandingPage(this.page);
    await expect(landingPage.text_Willkommen).toBeVisible();
    return new LandingPage(this.page);
  }

  public async goToLogin(): Promise<LoginPage> {
    await this.button_login.click();
    return new LoginPage(this.page);
  }

  public async goToProfile(): Promise<ProfilePage> {
    await this.button_profil.click();
    return new ProfilePage(this.page);
  }
}
