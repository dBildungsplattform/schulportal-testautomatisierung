import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from "../pages/Header.page";

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
   test('Erfolgreicher Standard Login', async ({ page }) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
    const Start = new StartPage(page);
    const Header = new HeaderPage(page);

    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(Landing.text_Willkommen).toBeVisible();
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW);
      await expect(Start.text_h2_Ueberschrift).toBeVisible();
      await Header.button_logout.click();
    })
  })  
  
  test('Erfolgloser Login mit falschem Passwort', async ({ page }) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
  
    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(Landing.text_Willkommen).toBeVisible();
      await Landing.button_Anmelden.click();
      await Login.login(USER, 'Mickeymouse');
      await expect(Login.text_span_inputerror).toBeVisible();
      await expect(Login.text_h1).toBeVisible();
    })
  })
})