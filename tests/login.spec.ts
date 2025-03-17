import { test, expect, PlaywrightTestArgs } from '@playwright/test';
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
import { testschuleName } from '../base/organisation.ts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];

let loggedIn: boolean = false;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);
    const startseite: StartPage = new StartPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      // login as Landesadmin if neccessary
      if ((usernames.length > 0 || rolleIds.length > 0) && (!loggedIn)) {
        await page.goto('/');
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await startseite.checkHeadlineIsVisible();
        loggedIn = true
        
        if (usernames.length > 0) { 
          await deletePersonenBySearchStrings(page, usernames);
          usernames = [];
        }
  
        if (rolleIds.length > 0) { 
          await deleteRolleById(rolleIds, page);
          rolleIds = [];
        }
      }
    });

    if (loggedIn) {
      await test.step(`Abmelden`, async () => {
        await header.logout();
        loggedIn = false;
      });
    }
  });

   test('Erfolgreicher Standard Login Landesadmin', {tag: [LONG, SMOKE, STAGE, BROWSER]}, async ({ page }: PlaywrightTestArgs) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);
    const startseite: StartPage = new StartPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      
      await login.login(ADMIN, PW);
      await startseite.checkHeadlineIsVisible();
      loggedIn = true;
    })
  })

  test('Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin', {tag: [LONG, SHORT, STAGE]}, async ({ page }: PlaywrightTestArgs) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login(ADMIN, 'Mickeymouse');
      await expect(login.inputErrorMessage).toHaveText('Ungültiger Benutzername oder Passwort.');
      await expect(login.titleAnmeldung).toBeVisible();
      loggedIn = false;
    })
  })

  test('Erfolgloser Login mit einem gesperrten Benutzer Rolle Lehrer', {tag: [LONG, STAGE]}, async ({ page }: PlaywrightTestArgs) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);
    const header: HeaderPage = new HeaderPage(page);

    const lehrerVorname: string = await generateVorname();
    const lehrerNachname: string =await generateNachname();
    const lehrerRolle:string = await generateRolleName();
    const lehrerRollenart: string = 'LEHR';
    const lehrerOrganisation: string = testschuleName;
    let userInfoLehrer: UserInfo;
    let organisationIDLandSh: string = '';
 
    await test.step(`Testdaten: Gesperrten Lehrer über die api anlegen ${ADMIN}`, async () => {
      await page.goto('/');
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      const lehrerIdSPs: string[] = [await getSPId(page, 'E-Mail')];
      organisationIDLandSh = await getOrganisationId(page, 'Land Schleswig-Holstein');
      userInfoLehrer = await createRolleAndPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, lehrerIdSPs, lehrerRolle);
      usernames.push(userInfoLehrer.username);
      rolleIds.push(userInfoLehrer.rolleId);
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

  test('Erfolgloser Login mit falschem Benutzernamen und gültigem Passwort in der Rolle Landesadmin', {tag: [LONG, STAGE]}, async ({ page }: PlaywrightTestArgs) => {
    const login: LoginPage = new LoginPage(page);
    const landing: LandingPage = new LandingPage(page);
    const start: StartPage = new StartPage(page);

    await test.step('Anmelden mit falschem Benutzernamen fake-username, Inputfeld für Benutzernamen bleibt änderbar', async () => {
      await page.goto('/');
      await expect(landing.text_Willkommen).toBeVisible();
      await landing.button_Anmelden.click();
      await login.login('fake-username', PW);
      await expect(login.inputErrorMessage).toBeVisible();
      await expect(login.titleAnmeldung).toBeVisible();
      await expect(login.input_username).toBeEditable();
      loggedIn = false;
    })

    await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
      await login.login(ADMIN, PW);
      await start.checkHeadlineIsVisible();
      loggedIn = true;
    })
  })
})