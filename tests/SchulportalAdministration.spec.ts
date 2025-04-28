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
import {
  generateNachname,
  generateRolleName,
  generateVorname,
  generateKopersNr,
} from '../base/testHelperGenerateTestdataNames';
import { testschuleName } from '../base/organisation';
import FromAnywhere from '../pages/FromAnywhere';
import {
  email,
  itslearning,
  schulportaladmin,
  kalender,
  adressbuch,
  opSH,
  schoolSH,
  webUntis,
  anleitungen,
  helpdeskKontaktieren,
  psychosozialesBeratungsangebot,
  schulrechtAZ,
} from '../base/sp';
import { typeLehrer } from '../base/rollentypen.ts';
import { generateCurrentDate } from '../base/testHelperUtils.ts';
import { befristungPflicht, kopersNrPflicht } from '../base/merkmale.ts';

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

  test(
    'News-Box bei befristeten Schulzuordnungen testen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
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
    }
  );

  test(
    'Für alle Rollen der Rollenart LEHR prüfen, dass die korrekten Service Provider auf der Startseite angezeigt werden',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const startseite: StartPage = new StartPage(page);

      // Zu testende Lehrkräfte
      let userInfoLehrerReligionsLehrkraft: UserInfo;
      let userInfoLehrerItslearningLehrkraft: UserInfo;
      let userInfoLehrerLehrkraft: UserInfo;
      let userInfoLehrerPilotProjektSchulverwaltungskraft: UserInfo;
      let userInfoLehrerIqshMitarbeiter: UserInfo;
      let userInfoLehrerStudentImPraxissemester: UserInfo;
      let userInfoLehrerLiV: UserInfo;
      let userInfoLehrerVertretungslehrkraft: UserInfo;

      await test.step(`Testdaten: Lehrer mit Rollen anlegen`, async () => {
        // Rollen ohne Merkmale
        userInfoLehrerReligionsLehrkraft = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, adressbuch),
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
            await getSPId(page, schulrechtAZ),
          ],
          await generateRolleName()
        );
        personIds.push(userInfoLehrerReligionsLehrkraft.personId);
        rolleIds.push(userInfoLehrerReligionsLehrkraft.rolleId);

        userInfoLehrerItslearningLehrkraft = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, itslearning)],
          await generateRolleName()
        );
        personIds.push(userInfoLehrerItslearningLehrkraft.personId);
        rolleIds.push(userInfoLehrerItslearningLehrkraft.rolleId);

        // Rollen mit KopersPflicht
        userInfoLehrerLehrkraft = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfoLehrerLehrkraft.personId);
        rolleIds.push(userInfoLehrerLehrkraft.rolleId);

        userInfoLehrerPilotProjektSchulverwaltungskraft = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfoLehrerPilotProjektSchulverwaltungskraft.personId);
        rolleIds.push(userInfoLehrerPilotProjektSchulverwaltungskraft.rolleId);

        userInfoLehrerIqshMitarbeiter = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, itslearning),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [kopersNrPflicht]
        );
        personIds.push(userInfoLehrerIqshMitarbeiter.personId);
        rolleIds.push(userInfoLehrerIqshMitarbeiter.rolleId);

        // Rollen mit Befristungspflicht
        userInfoLehrerStudentImPraxissemester = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, itslearning),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          undefined,
          undefined,
          [befristungPflicht]
        );
        personIds.push(userInfoLehrerStudentImPraxissemester.personId);
        rolleIds.push(userInfoLehrerStudentImPraxissemester.rolleId);

        // Rollen mit Kopers- und Befristungspflicht
        userInfoLehrerLiV = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [befristungPflicht, kopersNrPflicht]
        );
        personIds.push(userInfoLehrerLiV.personId);
        rolleIds.push(userInfoLehrerLiV.rolleId);

        userInfoLehrerVertretungslehrkraft = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [
            await getSPId(page, email),
            await getSPId(page, kalender),
            await getSPId(page, adressbuch),
            await getSPId(page, opSH),
            await getSPId(page, schoolSH),
            await getSPId(page, webUntis),
            await getSPId(page, anleitungen),
            await getSPId(page, schulrechtAZ),
            await getSPId(page, helpdeskKontaktieren),
            await getSPId(page, psychosozialesBeratungsangebot),
          ],
          await generateRolleName(),
          await generateKopersNr(),
          undefined,
          [befristungPflicht, kopersNrPflicht]
        );
        personIds.push(userInfoLehrerVertretungslehrkraft.personId);
        rolleIds.push(userInfoLehrerVertretungslehrkraft.rolleId);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer Religionslehrkraft meldet sich an`, async () => {
        // Lehrer meldet sich
        currentUserIsLandesadministrator = false;
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerReligionsLehrkraft.username, userInfoLehrerReligionsLehrkraft.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleReligionslehrkraft: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleReligionslehrkraft);
        await startseite.checkSpIsHidden([schulportaladmin, itslearning]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer Itslearninglehrkraft meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerItslearningLehrkraft.username, userInfoLehrerItslearningLehrkraft.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleReligionslehrkraft: string[] = [itslearning];
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleReligionslehrkraft);
        await startseite.checkSpIsHidden([schulportaladmin, email]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer Lehrkraft meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerLehrkraft.username, userInfoLehrerLehrkraft.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRollelehrkraftOeffentlich: string[] = [
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

        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRollelehrkraftOeffentlich);
        await startseite.checkSpIsHidden([schulportaladmin, itslearning]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer PilotProjektSchulverwaltungskraft meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(
          userInfoLehrerPilotProjektSchulverwaltungskraft.username,
          userInfoLehrerPilotProjektSchulverwaltungskraft.password
        );
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRollePilotProjektSchulverwaltungskraft: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRollePilotProjektSchulverwaltungskraft);
        await startseite.checkSpIsHidden([schulportaladmin, opSH, itslearning]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer iQSHMitarbeiter meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerIqshMitarbeiter.username, userInfoLehrerIqshMitarbeiter.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleIqshMitarbeiter: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleIqshMitarbeiter);
        await startseite.checkSpIsHidden([schulportaladmin]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer LehrerStudentImPraxissemester meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(
          userInfoLehrerStudentImPraxissemester.username,
          userInfoLehrerStudentImPraxissemester.password
        );
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleIqshMitarbeiter: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleIqshMitarbeiter);
        await startseite.checkSpIsHidden([schulportaladmin]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer LehrerLiV meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerLiV.username, userInfoLehrerLiV.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleIqshMitarbeiter: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleIqshMitarbeiter);
        await startseite.checkSpIsHidden([schulportaladmin, itslearning]);
      });

      await test.step(`Lehrer mit einer Rolle wie bei einer LehrerVertretungslehrkraft meldet sich an`, async () => {
        // Lehrer meldet sich
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfoLehrerVertretungslehrkraft.username, userInfoLehrerVertretungslehrkraft.password);
        await login.updatePW();

        // Prüfen, dass dem Lehrer auf der Startseite die erwarteten Angebote angezeigt werden
        const expectedSPsRolleIqshMitarbeiter: string[] = [
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
        await startseite.validateStartPageIsLoaded();
        await startseite.checkSpIsVisible(expectedSPsRolleIqshMitarbeiter);
        await startseite.checkSpIsHidden([schulportaladmin, itslearning]);
      });
    }
  );
});
