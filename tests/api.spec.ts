import { test, expect } from '@playwright/test';
import { json } from '@data.json';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Spike um die API anzusprechen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('GET', async ({ page, request,}) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
    const Start = new StartPage(page);
    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(Landing.text_Willkommen).toBeVisible();
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW);
      await expect(Start.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`API ansprechen mit GET ${USER}`, async () => {
      const response = await page.request.get('https://main.dev.spsh.dbildungsplattform.de/api/personen/'); 
      console.log(await response.json());
    })


    const allCookies = await page.context().cookies();
    let mycookie = '';
    allCookies.forEach((item) => {
      if(item.name == 'connect.sid') {
        mycookie = item.value;
      }
    })
  })  
})







