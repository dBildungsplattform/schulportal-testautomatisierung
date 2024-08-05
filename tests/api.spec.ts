import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { faker } from "@faker-js/faker/locale/de";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { HeaderPage } from "../pages/Header.page";

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Spike um die API anzusprechen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }) => {
    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test('GET und Post request', async ({ page}) => {
    const Login = new LoginPage(page);
    const Landing = new LandingPage(page);
    const Start = new StartPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();

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

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  })  
})