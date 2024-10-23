import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, SMOKE, STAGE } from '../base/tags';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
   test('Erfolgreicher Standard Login Landesadmin', {tag: [LONG, SMOKE, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);
    const start = new StartPage(page);
    const header = new HeaderPage(page);

    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login(USER, PW);
      await expect(start.text_h2_Ueberschrift).toBeVisible();
      await header.button_logout.click();
    })
  })

  test('Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);

    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login(USER, 'Mickeymouse');
      await expect(login.text_span_inputerror).toBeVisible();
      await expect(login.text_h1).toBeVisible();
    })
  })
})