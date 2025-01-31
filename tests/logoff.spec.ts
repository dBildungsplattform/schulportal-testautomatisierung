import { test } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { HeaderPage } from '../pages/Header.page';
import { LONG, SHORT, STAGE } from '../base/tags';

const ADMIN: string | undefined = process.env.USER;
const PW: string | undefined = process.env.PW;

let loggedIn = false;

test.afterEach(async ({ page }) => {
  if (loggedIn) {
    const header: HeaderPage = new HeaderPage(page);
    await header.logout();
    loggedIn = false;
  }
})

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Erfolgreicher Standard Logoff als Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const landing: LandingPage = new LandingPage(page);
    const header = new HeaderPage(page);

    await test.step(`Annmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      const login: LoginPage = await landing.goToLogin();
      await page.waitForResponse(async response => 
        (response.url().includes('/api/provider') && ((response.status() === 200 ) || (response.status() === 304 )))
     )
      const startseite: StartPage = await login.login(ADMIN, PW); 
      await startseite.checkHeadlineIsVisible();
    })
    
    await test.step(`Benutzer abmelden`, async () => {
      await header.logout();
      loggedIn = false;
    })
  })
})