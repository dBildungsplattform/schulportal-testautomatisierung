import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page';
import { getOrganisationId } from '../base/api/testHelperOrganisation.page';
import {
  createRolleAndPersonWithUserContext,
  setTimeLimitPersonenkontext,
} from '../base/api/testHelperPerson.page';
import { createPerson } from '../base/api/personApi';
import { addSPToRolle, addSystemrechtToRolle } from '../base/api/testHelperRolle.page';
import { createRolle } from '../base/api/rolleApi';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { klasse1Testschule } from '../base/klassen';
import { befristungPflicht, kopersNrPflicht } from '../base/merkmale';
import { testschuleName } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import {
  adressbuch,
  anleitungen,
  email,
  helpdeskKontaktieren,
  itslearning,
  kalender,
  opSH,
  psychosozialesBeratungsangebot,
  schoolSH,
  schulportaladmin,
  schulrechtAZ,
  webUntis,
} from '../base/sp';
import { LONG, SHORT, STAGE } from '../base/tags';
import { deletePersonById, deleteRolleById } from '../base/testHelperDeleteTestdata';
import {
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/utils/generateTestdata';
import { generateCurrentDate } from '../base/utils/generateTestdata';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/components/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';

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
      await landing.buttonAnmelden.click();
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
      logoutViaStartPage = true;

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
      await landing.buttonAnmelden.click();
      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
      await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
        await expect(startseite.cardItemSchulportalAdministration).toBeHidden();
        await startseite.checkSpIsVisible([email]);
      });
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
      const schuleId: string = await getOrganisationId(page, testschuleName);
      const klasseId: string = await getOrganisationId(page, klasse1Testschule);
      const idSPs: string[] = [await getSPId(page, 'itslearning')];
      const rolleId: string = await createRolle(page, 'LERN', schuleId, await generateRolleName());
      await addSPToRolle(page, rolleId, idSPs);
      const userInfo: UserInfo = await createPerson(
        page,
        schuleId,
        rolleId,
        await generateNachname(),
        await generateVorname(),
        '',
        klasseId
      );
      personIds.push(userInfo.personId);
      rolleIds.push(userInfo.rolleId);

      await header.logout({ logoutViaStartPage: true });

      // Test durchführen
      await landing.buttonAnmelden.click();
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
      await landing.buttonAnmelden.click();
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

  test('News-Box bei befristeten Schulzuordnungen testen', { tag: [LONG] }, async ({ page }: PlaywrightTestArgs) => {
    let userInfoLehrer1: UserInfo;
    let userInfoLehrer2: UserInfo;
    const rollenNameLehrer1: string = await generateRolleName();
    const rollenNameLehrer2: string = await generateRolleName();
    const colorOrange: string = 'rgb(255, 152, 37)';
    const colorRed: string = 'rgb(255, 85, 85)';

    const headerPage: HeaderPage = new HeaderPage(page);
    const loginPage: LoginPage = new LoginPage(page);

    await test.step(`Testdaten: Lehrer1 mit einer befristeten Schulzuordnung(noch 50 Tage gültig) und Lehrer2 mit einer befristeten Schulzuordnung(noch 12 Tage gültig) über die api anlegen`, async () => {
      // Lehrer1: Schulzuordnung noch 50 Tage gültig
      userInfoLehrer1 = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        typeLehrer,
        await generateNachname(),
        await generateVorname(),
        [await getSPId(page, email)],
        rollenNameLehrer1
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
        rollenNameLehrer2
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

    await test.step(`Lehrer1 meldet sich an und die orangene News-Box wird geprüft`, async () => {
      const timeLimitTeacherRolle1: string = await generateCurrentDate({ days: 50, months: 0, formatDMY: true });
      const alertText: string =
        `Hinweis: Die Zuordnung dieses Benutzerkontos zu der Schule "${testschuleName}" mit der Rolle "${rollenNameLehrer1}" ist bis zum ${timeLimitTeacherRolle1} befristet. ` +
        `Sollte dies nicht zutreffen, wenden Sie sich bitte an Ihre Schulleitung. Nach Ende der Zuordnung sind Funktionalitäten, die im Bezug zu dieser Schule und Rolle stehen, nicht mehr verfügbar.`;

      const landingPage: LandingPage = await headerPage.logout({ logoutViaStartPage: true });
      await landingPage.buttonAnmelden.click();
      const startView: StartPage = await loginPage.login(userInfoLehrer1.username, userInfoLehrer1.password);
      await loginPage.updatePW();
      await startView.validateStartPageIsLoaded();
      currentUserIsLandesadministrator = false;

      await expect(page.getByText(alertText)).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCSS('background-color', colorOrange);
    });

    await test.step(`Lehrer2 meldet sich an und die rote News-Box wird geprüft`, async () => {
      const timeLimitTeacherRolle2: string = await generateCurrentDate({ days: 12, months: 0, formatDMY: true });
      const alertText: string =
        `Hinweis: Die Zuordnung dieses Benutzerkontos zu der Schule "${testschuleName}" mit der Rolle "${rollenNameLehrer2}" ist bis zum ${timeLimitTeacherRolle2} befristet. ` +
        `Sollte dies nicht zutreffen, wenden Sie sich bitte an Ihre Schulleitung. Nach Ende der Zuordnung sind Funktionalitäten, die im Bezug zu dieser Schule und Rolle stehen, nicht mehr verfügbar.`;

      const landingPage: LandingPage = await headerPage.logout({ logoutViaStartPage: true });
      await landingPage.buttonAnmelden.click();
      const startView: StartPage = await loginPage.login(userInfoLehrer2.username, userInfoLehrer2.password);
      await loginPage.updatePW();
      await startView.validateStartPageIsLoaded();
      currentUserIsLandesadministrator = false;

      await expect(page.getByText(alertText)).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCSS('background-color', colorRed);
    });
  });

  test(
    'Für ReligionsLehrkraft prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expectedSps: string[] = [
        adressbuch,
        email,
        kalender,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
        schulrechtAZ,
      ];
      const unexpectedSps: string[] = [schulportaladmin, itslearning];

      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expectedSps.map((sp: string) => getSPId(page, sp))),
          await generateRolleName()
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expectedSps);
        await startPage.checkSpIsHidden(unexpectedSps);
      });
    }
  );

  test(
    'Für Itslearning-Lehrkraft prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, itslearning)],
          await generateRolleName()
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible([itslearning]);
        await startPage.checkSpIsHidden([schulportaladmin, email]);
      });
    }
  );

  test(
    'Für Lehrkraft prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();
        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin, itslearning]);
      });
    }
  );

  test(
    'Für PilotProjektSchulverwaltungskraft prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin, opSH, itslearning]);
      });
    }
  );

  test(
    'Für iQSH-Mitarbeiter prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        itslearning,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin]);
      });
    }
  );

  test(
    'Für Student im Praxissemester prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        itslearning,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          undefined,
          undefined,
          [befristungPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin]);
      });
    }
  );

  test(
    'Für LehrerLiV prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [befristungPflicht, kopersNrPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin, itslearning]);
      });
    }
  );

  test(
    'Für Vertretungslehrkraft prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const expected: string[] = [
        email,
        kalender,
        adressbuch,
        opSH,
        schoolSH,
        webUntis,
        anleitungen,
        schulrechtAZ,
        helpdeskKontaktieren,
        psychosozialesBeratungsangebot,
      ];
      const userInfo: UserInfo = await test.step('Testdaten anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          await Promise.all(expected.map((sp: string) => getSPId(page, sp))),
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [befristungPflicht, kopersNrPflicht]
        );
        personIds.push(userInfo.personId);
        rolleIds.push(userInfo.rolleId);
        return userInfo;
      });

      await test.step('Anmelden und Startseite prüfen', async () => {
        const header: HeaderPage = new HeaderPage(page);
        currentUserIsLandesadministrator = false;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: false });
        const loginPage: LoginPage = await landingPage.goToLogin();
        const startPage: StartPage = await loginPage.login(userInfo.username, userInfo.password);
        await loginPage.updatePW();

        await startPage.checkSpIsVisible(expected);
        await startPage.checkSpIsHidden([schulportaladmin, itslearning]);
      });
    }
  );
});
