import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { StartPage } from '../pages/start.page';
import { LoginPage } from '../pages/login.page';
import { HeaderPage } from '../pages/header.page';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('SPSH-185 Erfolgreicher Standard Logoff', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page)
    const Login = new LoginPage(page);
    const Header = new HeaderPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
    
    await test.step(`Abmelden Benutzer ${USER}`, async () => {
      await Header.button_logout.click(); 
      await expect(Landing.text_Willkommen).toBeEnabled();
    })
  })  
})