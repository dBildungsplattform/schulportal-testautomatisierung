import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login';
import { StartseitePage } from '../../pages/startseite';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('[02] Erfolgreicher Standard Logoff', async ({ page }) => {
    // await page.pause();
    const Login = new LoginPage(page);
    const Startseite = new StartseitePage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await Login.login(USER, PW, URL_PORTAL); 
    })
    await expect(Startseite.text_h1_UeberschriftStartseite).toBeVisible();

    await test.step(`Abnmelden Benutzer ${USER}`, async () => {
      await Login.logoff(); 
    })
    await expect(Login.text_h1_UeberschriftLoginSeite).toBeVisible();
    // await page.pause();
  })  
})