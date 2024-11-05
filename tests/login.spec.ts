import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, SMOKE, STAGE } from '../base/tags';
import { createPersonWithUserContext, lockPerson } from "../base/api/testHelperPerson.page.ts";
import { getSPId } from "../base/api/testHelperServiceprovider.page.ts";
import { faker } from "@faker-js/faker/locale/de";
import { UserInfo } from "../base/api/testHelper.page.ts";
import { deletePersonByUsername, deleteRolleById } from "../base/testHelperDeleteTestdata.ts";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

let loggedIn = false;
let username: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht
let roleId: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }) => {
    const header = new HeaderPage(page);
    const landing = new LandingPage(page);
    const login = new LoginPage(page);
    const startseite = new StartPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (!loggedIn) {
        await test.step(`Abmelden`, async () => {
          const landing = new LandingPage(page);
          const startseite = new StartPage(page);
          const login = new LoginPage(page);
          
          await page.goto(FRONTEND_URL);
          await landing.button_Anmelden.click();
          await login.login(ADMIN, PW);
          await expect(startseite.text_h2_Ueberschrift).toBeVisible();
          loggedIn = true
        });
      }

      if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deletePersonByUsername(username, page);
        username = [];
      }

      if (roleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        await deleteRolleById(roleId, page);
        roleId = [];
      }
    });

    if (loggedIn) {
      await test.step(`Abmelden`, async () => {
        const header = new HeaderPage(page);
        await header.logout();
        loggedIn = false;
      });
    }
  });

   test('Erfolgreicher Standard Login Landesadmin', {tag: [LONG, SMOKE, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);
    const start = new StartPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      
      await login.login(ADMIN, PW);
      await expect(start.text_h2_Ueberschrift).toBeVisible();
      loggedIn = true;
    })
  })

  test('Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login(ADMIN, 'Mickeymouse');
      await expect(login.text_span_inputerror).toBeVisible();
      await expect(login.text_h1).toBeVisible();
      loggedIn = false;
    })
  })

  test.only('Erfolgloser Login mit einem gesperrten Benutzer Rolle Lehrer', {tag: [LONG, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);
    const header = new HeaderPage(page);

    const lehrerVorname = "TAuto-PW-V-" + faker.person.firstName();
    const lehrerNachname = "TAuto-PW-N-" + faker.person.lastName();
    const lehrerRolle = "TAuto-PW-LEHR-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const lehrerRollenart = 'LEHR';
    const lehrerOrganisation = 'Testschule Schulportal';
    let userInfoLehrer: UserInfo;
    let lehrerIdSP = '';
    let organisationIDLandSh = '';
 
    await test.step(`Testdaten: Gesperrten Lehrer über die api anlegen ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      lehrerIdSP = await getSPId(page, 'E-Mail');
      organisationIDLandSh = await getOrganisationId(page, 'Land Schleswig-Holstein');
      userInfoLehrer = await createPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, lehrerIdSP, lehrerRolle);
      username.push(userInfoLehrer.username);
      roleId.push(userInfoLehrer.rolleId);
      await lockPerson(page, userInfoLehrer.personId, organisationIDLandSh);
      await header.logout();
    })

    await test.step(`Gesperrter Lehrer versucht sich am Portal anzumelden`, async () => {
      await landing.button_Anmelden.click();
      await login.login(userInfoLehrer.username, userInfoLehrer.password);
      await expect(login.text_span_alertBox).toHaveText('Ihr Benutzerkonto ist gesperrt. Bitte wenden Sie sich an Ihren schulischen Administrator/Ihre schulische Administratorin.');
      loggedIn = false;
    })
  })
})