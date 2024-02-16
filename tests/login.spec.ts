import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { LandingPage } from '../pages/landing.page';
import { StartPage } from '../pages/start.page';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('Erfolgreicher Standard Login ohne Rolle', async ({ page }) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
    const Start = new StartPage(page);
    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await expect(Landing.text_Willkommen).toBeVisible();
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW);
      await expect(Start.text_h2_Ueberschrift).toBeVisible();
    })
  })  
  
  test('Erfolgloser Login mit falschem Passwort', async ({ page }) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
  
    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await expect(Landing.text_Willkommen).toBeVisible();
      await Landing.button_Anmelden.click();
      await Login.login(USER, 'Mickeymouse');
      await expect(Login.text_span_inputerror).toBeVisible();
      await expect(Login.text_h1).toBeVisible();
    })
  })
})