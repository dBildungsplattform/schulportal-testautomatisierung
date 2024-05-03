import { faker } from '@faker-js/faker/locale/de';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Spike um die API anzusprechen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('GET und Post request', async ({ page}) => {
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

    await test.step(`GET Request personen, alle Benutzer lesen`, async () => {
      const response = await page.request.get(FRONTEND_URL + 'api/personen/'); 
      expect(response.status()).toBe(200); 
    })

    await test.step(`POST Request personen, neuen Benutzer anlegen`, async () => {
      const Vorname = 'TAutoV' + faker.person.firstName(); 
      const Nachname = 'TAutoN' + faker.person.lastName() + '-' + faker.person.lastName(); // Wahrscheinlichkeit doppelter Namen verringern
      const response = await page.request.post(FRONTEND_URL + 'api/personen/', {
        data: { 
          "name": {
            "vorname": Vorname,
            "familienname": Nachname
          }
        }
      })   
      expect(response.status()).toBe(201);
    }) 
  })  
})