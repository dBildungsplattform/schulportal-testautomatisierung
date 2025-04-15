import { type Locator, Page, expect } from '@playwright/test';
import { LandingPage } from './LandingView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { LoginPage } from '../pages/LoginView.page';
import { ProfilePage } from './ProfileView.page';
import { StartPage } from './StartView.page';

export class HeaderPage {
  readonly page: Page;
  readonly buttonLogin: Locator;
  readonly buttonLogout: Locator;
  readonly buttonProfil: Locator;
  readonly iconMyProfil: Locator;
  readonly iconLogout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonLogin = page.getByTestId('nav-login-button');
    this.buttonLogout = page.getByTestId('nav-logout-button');
    this.buttonProfil = page.getByTestId('nav-profile-button');
    this.iconMyProfil = page.locator('.mdi-account-outline');
    this.iconLogout = page.locator('.mdi-logout');
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

    await this.buttonLogout.click();
    const landingPage: LandingPage = new LandingPage(this.page);
    await expect(landingPage.textWillkommen).toBeVisible();
    return new LandingPage(this.page);
  }

  public async goToLogin(): Promise<LoginPage> {
    await this.buttonLogin.click();
    return new LoginPage(this.page);
  }

  public async goToProfile(): Promise<ProfilePage> {
    await this.buttonProfil.click();
    return new ProfilePage(this.page);
  }
}
