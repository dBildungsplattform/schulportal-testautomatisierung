import { PlaywrightTestArgs, test } from '@playwright/test';
import { DEV, STAGE } from '../base/tags';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from '../pages/components/Header.page';

const ADMIN: string | undefined = process.env.USER;
const PW: string | undefined = process.env.PW;

let loggedIn: boolean = false;
const logoutViaStartPage: boolean = false;

test.afterEach(async ({ page }: PlaywrightTestArgs) => {
  if (loggedIn) {
    const header: HeaderPage = new HeaderPage(page);
    if (logoutViaStartPage) {
      await header.logout({ logoutViaStartPage: true });
    } else {
      await header.logout({ logoutViaStartPage: false });
    }
    loggedIn = false;
  }
});

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Erfolgreicher Standard Logoff als Landesadmin', { tag: [STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
    const landing: LandingPage = new LandingPage(page);
    const header: HeaderPage = new HeaderPage(page);

    await test.step(`Annmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      const login: LoginPage = await landing.goToLogin();
      const startseite: StartPage = await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
    });

    await test.step(`Benutzer abmelden`, async () => {
      await header.logout({ logoutViaStartPage: false });
      loggedIn = false;
    });
  });
});
