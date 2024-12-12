import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginView.page';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, SMOKE, STAGE, BROWSER } from '../base/tags';
import { createRolleAndPersonWithUserContext, lockPerson } from "../base/api/testHelperPerson.page.ts";
import { getSPId } from "../base/api/testHelperServiceprovider.page.ts";
import { UserInfo } from "../base/api/testHelper.page.ts";
import { deletePersonenBySearchStrings, deleteRolleById } from "../base/testHelperDeleteTestdata.ts";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page.ts";
import { generateRolleName, generateNachname, generateVorname } from '../base/testHelperGenerateTestdataNames.ts';
import { testschule } from '../base/organisation.ts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

let loggedIn = false;
let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }) => {
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);
    const startseite: StartPage = new StartPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (!loggedIn) {
        await test.step(`Abmelden`, async () => {
          const landing: LandingPage = new LandingPage(page);
          const startseite: StartPage = new StartPage(page);
          const login: LoginPage = new LoginPage(page);
          
          await page.goto('/');
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
        
        await deletePersonenBySearchStrings(page, username);
        username = [];
      }

      if (rolleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        await deleteRolleById(rolleId, page);
        rolleId = [];
      }
    });

    if (loggedIn) {
      await test.step(`Abmelden`, async () => {
        const header: HeaderPage = new HeaderPage(page);
        await header.logout();
        loggedIn = false;
      });
    }
  });

   test('Erfolgreicher Standard Login Landesadmin', {tag: [LONG, SMOKE, STAGE, BROWSER]}, async ({ page }) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);
    const start: StartPage = new StartPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      
      await login.login(ADMIN, PW);
      await expect(start.text_h2_Ueberschrift).toBeVisible();
      loggedIn = true;
    })
  })

  test('Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login(ADMIN, 'Mickeymouse');
      await expect(login.text_span_inputerror).toBeVisible();
      await expect(login.text_h1).toBeVisible();
      loggedIn = false;
    })
  })

  test('Erfolgloser Login mit einem gesperrten Benutzer Rolle Lehrer', {tag: [LONG, STAGE]}, async ({ page }) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);
    const header = new HeaderPage(page);

    const lehrerVorname: string = await generateVorname();
    const lehrerNachname: string =await generateNachname();
    const lehrerRolle:string = await generateRolleName();
    const lehrerRollenart: string = 'LEHR';
    const lehrerOrganisation: string = testschule;
    let userInfoLehrer: UserInfo;
    let lehrerIdSP: string = '';
    let organisationIDLandSh: string = '';
 
    await test.step(`Testdaten: Gesperrten Lehrer über die api anlegen ${ADMIN}`, async () => {
      await page.goto('/');
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      const lehrerIdSPs: Array<string> = [await getSPId(page, 'E-Mail')];
      organisationIDLandSh = await getOrganisationId(page, 'Land Schleswig-Holstein');
      userInfoLehrer = await createRolleAndPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, lehrerIdSPs, lehrerRolle);
      username.push(userInfoLehrer.username);
      rolleId.push(userInfoLehrer.rolleId);
      await lockPerson(page, userInfoLehrer.personId, organisationIDLandSh);
      await header.logout();
    })

    await test.step(`Gesperrter Lehrer versucht sich am Portal anzumelden`, async () => {
      await landing.button_Anmelden.click();
      await login.login(userInfoLehrer.username, userInfoLehrer.password);
      await expect(login.text_span_alertBox).toHaveText('Ihr Benutzerkonto ist gesperrt. Bitte wenden Sie sich an Ihre schulischen Administratorinnen und Administratoren.');
      loggedIn = false;
    })
  })

  test('Erfolgloser Login mit falschem Benutzernamen und gültigem Passwort in der Rolle Landesadmin', {tag: [LONG, STAGE]}, async ({ page }) => {
    const login = new LoginPage(page);
    const landing = new LandingPage(page);
    const start = new StartPage(page);

    await test.step('Anmelden mit falschem Benutzernamen fake-username, Inputfeld für Benutzernamen bleibt änderbar', async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login('fake-username', PW);
      await expect(login.text_span_inputerror).toBeVisible();
      await expect(login.text_h1).toBeVisible();
      await expect(login.input_username).toBeEditable();
      loggedIn = false;
    })

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await login.login(ADMIN, PW);
      await expect(start.text_h2_Ueberschrift).toBeVisible();
      loggedIn = true;
    })
  })
})