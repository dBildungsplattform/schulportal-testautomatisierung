import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { HeaderPage } from '../pages/Header.page';
import { LONG, SHORT, STAGE } from '../base/tags';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Erfolgreicher Standard Logoff als Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const landing = new LandingPage(page);
    const startseite = new StartPage(page);
    const login = new LoginPage(page);
    const header = new HeaderPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await landing.button_Anmelden.click();
      await login.login(USER, PW); 
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    })
    
    await test.step(`Abmelden Benutzer ${USER}`, async () => {
      await header.button_logout.click(); 
      await expect(landing.text_Willkommen).toBeEnabled();
    })
  })
})