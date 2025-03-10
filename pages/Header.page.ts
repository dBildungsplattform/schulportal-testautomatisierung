import { type Locator, Page, expect } from '@playwright/test';
import { LandingPage } from './LandingView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { LoginPage } from '../pages/LoginView.page';
import { ProfilePage } from './ProfileView.page';

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

  async logout(logoutViaStartPage?: boolean): Promise<LandingPage> {
    // Wenn man auf den Abmelden-Button klickt, laufen häufig noch diverse requests. Deshalb brauchen wir hier eine kurze Verzögerung bzw. einen Sprung auf die Startseite --> depricated
    // Dieser Zweig soll nicht mehr durchlaufen werden, da die Tests selber dafür zuständig sind, dass am Testende keine Requests mehr laufen
    // Es sind noch nicht alle Tests umgestellt
    // Neue Tests dürfen bei der Abmeldung nicht über die Startseite gehen!!!
    if (logoutViaStartPage) {
      await FromAnywhere(this.page).start();
      await this.page.waitForResponse((resp) => resp.url().includes('/api/provider') && resp.status() === 200);
      await this.page.waitForResponse('/api/provider/**/logo');
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
