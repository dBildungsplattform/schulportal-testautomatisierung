import { expect, test, PlaywrightTestArgs } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { HeaderPage } from '../pages/Header.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { createRolleAndPersonWithUserContext, setTimeLimitPersonenkontext } from '../base/api/testHelperPerson.page';
import { addSystemrechtToRolle } from '../base/api/testHelperRolle.page';
import { UserInfo } from '../base/api/testHelper.page';
import { LONG, SHORT, STAGE } from '../base/tags';
import { deletePersonById, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { generateNachname, generateRolleName, generateVorname } from '../base/testHelperGenerateTestdataNames';
import { testschuleName } from '../base/organisation';
import FromAnywhere from '../pages/FromAnywhere';
import { email, itslearning, schulportaladmin } from '../base/sp';
import { typeLehrer } from '../base/rollentypen.ts';
import { generateCurrentDate, gotoTargetURL } from '../base/testHelperUtils.ts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let personIds: string[] = [];
let rolleIds: string[] = [];

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für Schulportal Administration": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);

      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
    }

    await test.step(`Testdaten löschen via API`, async () => {
      if (personIds.length > 0) {
        await deletePersonById(personIds, page);
        personIds = [];
      }

      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test(
    'Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Lehrkräfte',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const startseite: StartPage = new StartPage(page);

      // Testdaten erstellen
      const idSPs: string[] = [await getSPId(page, 'E-Mail')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        'LEHR',
        await generateNachname(),
        await generateVorname(),
        idSPs,
        await generateRolleName()
      );
      personIds.push(userInfo.personId);
      rolleIds.push(userInfo.rolleId);
      await header.logout({ logoutViaStartPage: true });

      // Test durchführen
      await landing.button_Anmelden.click();
      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
      await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
        await expect(startseite.cardItemSchulportalAdministration).toBeHidden();
        await startseite.checkSpIsVisible([email]);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Schüler',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const startseite: StartPage = new StartPage(page);

      // Testdaten erstellen
      const idSPs: string[] = [await getSPId(page, 'itslearning')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        'LERN',
        await generateNachname(),
        await generateVorname(),
        idSPs,
        await generateRolleName()
      );
      personIds.push(userInfo.personId);
      rolleIds.push(userInfo.rolleId);
      await header.logout({ logoutViaStartPage: true });

      // Test durchführen
      await landing.button_Anmelden.click();
      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
      await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
        await expect(startseite.cardItemSchulportalAdministration).toBeHidden();
        await startseite.checkSpIsVisible([itslearning]);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Prüfen, dass die Schulportal-Administration Kachel sichtbar ist für Schuladmins',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const startseite: StartPage = new StartPage(page);

      // Testdaten erstellen
      const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        'LEIT',
        await generateNachname(),
        await generateVorname(),
        idSPs,
        await generateRolleName()
      );
      personIds.push(userInfo.personId);
      rolleIds.push(userInfo.rolleId);

      await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
      await header.logout({ logoutViaStartPage: true });

      // Test durchführen
      await landing.button_Anmelden.click();
      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
      await test.step(`Prüfen, dass die Kachel E-Mail nicht angezeigt wird und die Kachel Schulportal-Administration angezeigt wird`, async () => {
        await startseite.checkSpIsVisible([schulportaladmin]);
        await expect(startseite.cardItemEmail).toBeHidden();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test.only(
    'Hinweisbanner bei befristeten Schulzuordnungen testen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer1: UserInfo;
      let userInfoLehrer2: UserInfo;
      const timeLimitTeacherRolle1: string = await generateCurrentDate({ days: -50, months: 0, formatDMY: true });
      const timeLimitTeacherRolle2: string = await generateCurrentDate({ days: -12, months: 0, formatDMY: true });
      let timeLimitTeacherRolleNew: string;
      let colorTextEntireNameSchulzuordnung: string = '';

      await test.step(`Testdaten: Lehrer1 mit einer befristeten Schulzuordnung(noch 50 Tage gültig) und Lehrer2 mit einer befristeten Schulzuordnung(noch 12 Tage gültig) über die api anlegen`, async () => {
        // Lehrer1: Schulzuordnung noch 50 Tage gültig
        userInfoLehrer1 = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        personIds.push(userInfoLehrer1.personId);
        rolleIds.push(userInfoLehrer1.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer1.personId,
          userInfoLehrer1.organisationId,
          userInfoLehrer1.rolleId,
          await generateCurrentDate({ days: 50, months: 0, formatDMY: false })
        );

        // Lehrer2: Schulzuordnung noch 12 Tage gültig
        userInfoLehrer2 = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        personIds.push(userInfoLehrer2.personId);
        rolleIds.push(userInfoLehrer2.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer2.personId,
          userInfoLehrer2.organisationId,
          userInfoLehrer2.rolleId,
          await generateCurrentDate({ days: 12, months: 0, formatDMY: false })
        );
      });

      await test.step(`xxxxxx`, async () => {
        const header: HeaderPage = new HeaderPage(page);
        const landing: LandingPage = new LandingPage(page);
        const login: LoginPage = new LoginPage(page);
        const startseite: StartPage = new StartPage(page);

        await header.logout({ logoutViaStartPage: true });
        await landing.button_Anmelden.click();
        await login.login(userInfoLehrer1.username, userInfoLehrer1.password);
        await login.updatePW();
        await startseite.validateStartPageIsLoaded();
        currentUserIsLandesadministrator = false;
        await page.pause();
      });
    }
  );
});
