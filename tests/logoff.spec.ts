import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.';
import { MenuePage } from '../pages/menue.page.';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('Erfolgreicher Standard Logoff', async ({ page }) => {
    const Login = new LoginPage(page);
    const Menue = new MenuePage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await Menue.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Menue.button_Abmelden).toBeVisible();
    })
    
    await test.step(`Abmelden Benutzer ${USER}`, async () => {
      await Menue.button_Abmelden.click(); 
      await expect(Menue.button_Anmelden).toBeEnabled();
    })

    // await page.pause();
  })  
})