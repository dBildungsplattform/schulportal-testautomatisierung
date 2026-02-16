import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { getOrganisationId } from '../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, lockPerson, UserInfo } from '../base/api/personApi';
import { RollenArt } from '../base/api/rolleApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import { testschuleName } from '../base/organisation';
import { DEV, SMOKE, STAGE } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { loginAndNavigateToAdministration } from '../base/testHelperUtils';
import { generateNachname, generateRolleName, generateVorname } from '../base/utils/generateTestdata';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { StartViewPage as NewStartPage } from '../pages/StartView.neu.page';
import { HeaderPage } from '../pages/components/Header.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];

let loggedIn: boolean = false;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      // login as Landesadmin if neccessary
      if ((usernames.length > 0 || rolleIds.length > 0) && !loggedIn) {
        await loginAndNavigateToAdministration(page);
        loggedIn = true;

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
        if (logoutViaStartPage) {
          await header.logout({ logoutViaStartPage: true });
        } else {
          await header.logout({ logoutViaStartPage: false });
        }
        loggedIn = false;
      });
    }
  });

  test(
    'Erfolgreicher Standard Login Landesadmin',
    { tag: [SMOKE, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const login: LoginPage = new LoginPage(page);
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);

      await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
        await page.goto('/');
        await expect(landing.textWillkommen).toBeVisible();
        await landing.buttonAnmelden.click();

        await login.login(ADMIN, PW);
        await startseite.validateStartPageIsLoaded();
        loggedIn = true;
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const login: LoginPage = new LoginPage(page);
      const landing: LandingPage = new LandingPage(page);

      await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
        await page.goto('/');
        await expect(landing.textWillkommen).toBeVisible();
        await landing.buttonAnmelden.click();
        await login.login(ADMIN, 'Mickeymouse');
        await expect(login.inputErrorMessage).toHaveText('Ungültiger Benutzername oder Passwort.');
        await expect(login.titleAnmeldung).toBeVisible();
        loggedIn = false;
      });
    }
  );

  test(
    'Erfolgloser Login mit einem gesperrten Benutzer Rolle Lehrer',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const login: LoginPage = new LoginPage(page);
      const landing: LandingPage = new LandingPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const lehrerVorname: string = generateVorname();
      const lehrerNachname: string = generateNachname();
      const lehrerRolle: string = generateRolleName();
      const lehrerRollenart: RollenArt = 'LEHR';
      const lehrerOrganisation: string = testschuleName;
      let userInfoLehrer: UserInfo;
      let organisationIDLandSh: string = '';

      await test.step(`Testdaten: Gesperrten Lehrer über die api anlegen ${ADMIN}`, async () => {
        await page.goto('/');
        await landing.buttonAnmelden.click();
        await login.login(ADMIN, PW);
        const startPage: NewStartPage = new NewStartPage(page, ADMIN);
        await startPage.navigateToAdministration();
        const lehrerIdSPs: string[] = [await getServiceProviderId(page, 'E-Mail')];
        organisationIDLandSh = await getOrganisationId(page, 'Land Schleswig-Holstein');
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          lehrerOrganisation,
          lehrerRollenart,
          lehrerVorname,
          lehrerNachname,
          lehrerIdSPs,
          lehrerRolle
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
        await lockPerson(page, userInfoLehrer.personId, organisationIDLandSh);
        await header.logout({ logoutViaStartPage: true });
      });

      await test.step(`Gesperrter Lehrer versucht sich am Portal anzumelden`, async () => {
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrer.username, userInfoLehrer.password);
        await expect(login.textSpanAlertBox).toHaveText(
          'Ihr Benutzerkonto ist gesperrt. Bitte wenden Sie sich an Ihre schulischen Administratorinnen und Administratoren.'
        );
        loggedIn = false;
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Erfolgloser Login mit falschem Benutzernamen und gültigem Passwort in der Rolle Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const login: LoginPage = new LoginPage(page);
      const landing: LandingPage = new LandingPage(page);
      const start: StartPage = new StartPage(page);

      await test.step('Anmelden mit falschem Benutzernamen fake-username, Inputfeld für Benutzernamen bleibt änderbar', async () => {
        await page.goto('/');
        await expect(landing.textWillkommen).toBeVisible();
        await landing.buttonAnmelden.click();
        await login.login('fake-username', PW);
        await expect(login.inputErrorMessage).toBeVisible();
        await expect(login.titleAnmeldung).toBeVisible();
        await expect(login.inputUsername).toBeEditable();
        loggedIn = false;
      });

      await test.step(`Anmelden mit Benutzer ${ADMIN}`, async () => {
        await login.login(ADMIN, PW);
        await start.validateStartPageIsLoaded();
        loggedIn = true;
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
