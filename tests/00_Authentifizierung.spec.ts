import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('[01] Erfolgreicher Standard Login', async ({ page }) => {
    // await page.pause();
    const Login = new LoginPage(page);
    const Benutzer = 'HelloWorld'
    const PW = 'PwDontExists'

    await test.step(`Anmelden mit Benutzer ${Benutzer}`, async () => {
      await Login.login(Benutzer, PW, URL_PORTAL); 
    })
    // await page.pause();
  })

  test('[02] Erfolgreicher Standard Login', async ({ page }) => {
    // await page.pause();
    const Login = new LoginPage(page);
    const Benutzer = 'HelloWorld'
    const PW = 'PwDontExists'

    await test.step(`Anmelden mit Benutzer ${Benutzer}`, async () => {
      await Login.login(Benutzer, PW, URL_PORTAL); 
    })
    // await page.pause();
  })

  test('[03] Erfolgreicher Standard Login', async ({ page }) => {
    // await page.pause();
    const Login = new LoginPage(page);
    const Benutzer = 'HelloWorld'
    const PW = 'PwDontExists'

    await test.step(`Anmelden mit Benutzer ${Benutzer}`, async () => {
      await Login.login(Benutzer, PW, URL_PORTAL); 
    })
    // await page.pause();
  })
})