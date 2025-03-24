import { expect, test, PlaywrightTestArgs } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page.ts';
import { LoginPage } from '../pages/LoginView.page.ts';
import { StartPage } from '../pages/StartView.page.ts';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page.ts';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page.ts';
import { HeaderPage } from '../pages/Header.page.ts';
import { createRolleAndPersonWithUserContext, setTimeLimitPersonenkontext } from '../base/api/testHelperPerson.page.ts';
import { getSPId } from '../base/api/testHelperServiceprovider.page.ts';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { addSystemrechtToRolle } from '../base/api/testHelperRolle.page.ts';
import { LONG, STAGE, BROWSER } from '../base/tags.ts';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata.ts';
import { typeLehrer, typeSchueler, typeSchuladmin } from '../base/rollentypen.ts';
import { landSH, testschuleName, testschule665Name, testschuleDstNr } from '../base/organisation.ts';
import { email, itslearning } from '../base/sp.ts';
import {
  generateNachname,
  generateVorname,
  generateRolleName,
  generateKopersNr,
} from '../base/testHelperGenerateTestdataNames.ts';
import { generateCurrentDate, gotoTargetURL } from '../base/testHelperUtils.ts';
import { lehrkraftOeffentlichRolle, lehrkraftInVertretungRolle } from '../base/rollen.ts';
import FromAnywhere from '../pages/FromAnywhere';
import { befristungPflicht, kopersNrPflicht } from '../base/merkmale.ts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
    }

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
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
    'Eine Schulzuordnung bei einem bestehenden Benutzer hinzufügen',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const PersonDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      const addminVorname: string = await generateVorname();
      const adminNachname: string = await generateNachname();
      const adminRolle: string = await generateRolleName();
      const adminRollenart: string = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
      let userInfoAdmin: UserInfo;

      const lehrerVorname: string = await generateVorname();
      const lehrerNachname: string = await generateNachname();
      const lehrerRolle: string = await generateRolleName();
      const lehrerRollenart: string = typeLehrer;
      const lehrerOrganisation: string = testschule665Name;

      let userInfoLehrer: UserInfo;
      let lehrerBenutzername: string = '';
      const rolle: string = lehrkraftInVertretungRolle;
      const kopersNr: string = await generateKopersNr();

      await test.step(`Einen Schuladmin und einen zu bearbeitenden Lehrer mit je einer einer Schulzuordnung(Schule ist an einer Position > 25 in der DB) über die api anlegen und mit diesem Schuladmin anmelden`, async () => {
        // Schuladmin
        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          adminOrganisation,
          adminRollenart,
          addminVorname,
          adminNachname,
          adminIdSPs,
          adminRolle
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);

        // Lehrer
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          lehrerOrganisation,
          lehrerRollenart,
          lehrerVorname,
          lehrerNachname,
          [await getSPId(page, 'E-Mail')],
          lehrerRolle
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
        lehrerBenutzername = userInfoLehrer.username;

        await header.logout({ logoutViaStartPage: true });
        await landing.button_Anmelden.click();
        await login.login(userInfoAdmin.username, userInfoAdmin.password);
        await login.updatePW();
        await startseite.validateStartPageIsLoaded();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Die Gesamtübersicht des Lehrers öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(lehrerBenutzername);
        await page.getByRole('cell', { name: lehrerBenutzername, exact: true }).click();
      });

      await test.step(`Eine zweite Schulzuordnung hinzufügen`, async () => {
        await PersonDetailsView.button_editSchulzuordnung.click();
        await PersonDetailsView.button_addSchulzuordnung.click();
        expect(await PersonDetailsView.combobox_organisation.innerText()).toContain(adminOrganisation);
        await PersonDetailsView.combobox_rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await PersonDetailsView.input_kopersNr.fill(kopersNr);
        await PersonDetailsView.button_submitAddSchulzuordnung.click();
        await PersonDetailsView.button_confirmAddSchulzuordnung.click();
        await PersonDetailsView.button_saveAssignmentChanges.click();
        await PersonDetailsView.button_closeSaveAssignmentChanges.click();
      });

      await test.step(`In der Gesamtübersicht die neue Schulzuordnung prüfen`, async () => {
        await expect(page.getByTestId('person-details-card')).toContainText(
          '1111165 (Testschule-PW665): LiV (befristet bis'
        );
        await expect(page.getByTestId('person-details-card')).toContainText(
          '1111165 (Testschule-PW665): ' + lehrerRolle
        );
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test('Befristung beim hinzufügen von Personenkontexten', { tag: [LONG] }, async ({ page }: PlaywrightTestArgs) => {
    let userInfoLehrer: UserInfo;
    const unbefristeteRolle: string = lehrkraftOeffentlichRolle;
    const befristeteRolle: string = lehrkraftInVertretungRolle;

    await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
      userInfoLehrer = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        typeLehrer,
        await generateNachname(),
        await generateVorname(),
        [await getSPId(page, email)],
        await generateRolleName()
      );
      usernames.push(userInfoLehrer.username);
      rolleIds.push(userInfoLehrer.rolleId);
    });

    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

    const personDetailsView: PersonDetailsViewPage =
      await test.step(`Zu testenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen'); // Die Navigation ist nicht Bestandteil des Tests
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
      });

    await test.step(`Ansicht für neuen Personenkontext öffnen`, async () => {
      await personDetailsView.button_editSchulzuordnung.click();
      await personDetailsView.button_addSchulzuordnung.click();
      await personDetailsView.organisationenInput.searchByTitle(testschuleName, false);
    });

    await test.step(`Befristung bei ${unbefristeteRolle} und ${befristeteRolle} überprüfen`, async () => {
      await personDetailsView.rollen.selectByTitle(befristeteRolle);
      await expect(personDetailsView.button_befristetSchuljahresende).toBeChecked();
      await personDetailsView.rollen.selectByTitle(unbefristeteRolle);
      await expect(personDetailsView.button_befristungUnbefristet).toBeChecked();
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test(
    'Einen Benutzer über das FE unbefristet sperren',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const sperrDatumAbHeute: string = await generateCurrentDate({ days: 0, months: 0, formatDMY: true });

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage =
        await test.step(`Zu sperrenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
          await gotoTargetURL(page, 'admin/personen');
          await personManagementView.searchBySuchfeld(userInfoLehrer.username);
          return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
        });

      await test.step(`Lehrer sperren und anschließend prüfen, dass die Sperre gesetzt ist`, async () => {
        await personDetailsView.lockUserWithoutDate();
        await personDetailsView.checkUserIsLocked();
        await personDetailsView.checkLockDateFrom(sperrDatumAbHeute);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test('Einen Benutzer über das FE befristet sperren', { tag: [LONG, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    let userInfoLehrer: UserInfo;
    const sperrDatumAbHeute: string = await generateCurrentDate({ days: 0, months: 0, formatDMY: true });
    const sperrDatumBis: string = await generateCurrentDate({ days: 5, months: 2, formatDMY: true });

    await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
      userInfoLehrer = await createRolleAndPersonWithUserContext(
        page,
        testschuleName,
        typeLehrer,
        await generateNachname(),
        await generateVorname(),
        [await getSPId(page, email)],
        await generateRolleName()
      );
      usernames.push(userInfoLehrer.username);
      rolleIds.push(userInfoLehrer.rolleId);
    });

    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

    const personDetailsView: PersonDetailsViewPage =
      await test.step(`Zu sperrenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

    await test.step(`Lehrer sperren und anschließend prüfen, dass die Sperre gesetzt ist`, async () => {
      await personDetailsView.lockUserWithDate(sperrDatumBis);
      await personDetailsView.checkUserIsLocked();
      await personDetailsView.checkLockDateFrom(sperrDatumAbHeute);
      await personDetailsView.checkLockDateTo(sperrDatumBis);
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test(
    'Gesamtübersicht für einen Benutzer als Schueler öffnen und Unsichtbarkeit des 2FA Abschnitts prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Schüler mit einer Rolle(LERN) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeSchueler,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, itslearning)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`Gesamtübersicht Abschnitte prüfen`, async () => {
        await expect(personDetailsView.text_h2_benutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDetailsView.text_h3_passwort_headline).toBeVisible();
        await expect(personDetailsView.text_h3_schulzuordnung_headline).toBeVisible();
        await expect(personDetailsView.text_h3_lockPerson_headline).toBeVisible();
      });

      await test.step(`Unsichtbarkeit des 2FA Abschnitts prüfen`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeHidden();
        await expect(personDetailsView.text_token_IstEingerichtet_info).toBeHidden();
        await expect(personDetailsView.text_neuen_token_einrichten_info).toBeHidden();
        await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeHidden();
        await expect(personDetailsView.button_2FAEinrichten).toBeHidden();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Lehrkraft öffnen und 2FA Status prüfen dass kein Token eingerichtet ist',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeVisible();
        await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schuladmin öffnen und 2FA Status prüfen dass kein Token eingerichtet ist',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = await generateVorname();
      const adminNachname: string = await generateNachname();
      const adminRollenart: string = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          adminOrganisation,
          adminRollenart,
          addminVorname,
          adminNachname,
          [await getSPId(page, 'Schulportal-Administration')],
          await generateRolleName()
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeVisible();
        await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Landesadmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = await generateVorname();
      const adminNachname: string = await generateNachname();
      const organisation: string = landSH;
      const rollenart: string = 'SYSADMIN';

      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Landesadmin mit einer Rolle(SYSADMIN) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          addminVorname,
          adminNachname,
          [await getSPId(page, 'Schulportal-Administration')],
          await generateRolleName()
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'ROLLEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULTRAEGER_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_ANLEGEN');

        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
        await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schuladmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const adminRollenart: string = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          adminOrganisation,
          adminRollenart,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, 'Schulportal-Administration')],
          await generateRolleName()
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
        await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Lehrkraft öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.text_h3_2FA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
        await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Inbetriebnahme-Passwort über die Gesamtübersicht erzeugen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`Inbetriebnahme-Passwort für LK-Endgerät setzen`, async () => {
        await personDetailsView.createIbnPassword();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Befristung einer Schulzuordnung von einem Lehrer durch einen Landesadmin bearbeiten',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const timeLimitTeacherRolle: string = await generateCurrentDate({ days: 3, months: 5, formatDMY: true });
      let timeLimitTeacherRolleNew: string;
      const nameRolle: string = await generateRolleName();
      let colorTextEntireNameSchulzuordnung: string = '';

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und einer Schulzuordnung über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          nameRolle
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer.personId,
          userInfoLehrer.organisationId,
          userInfoLehrer.rolleId,
          await generateCurrentDate({ days: 3, months: 5, formatDMY: false })
        );
      });

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`Schulzuordnung im Bearbeitungsmodus öffen`, async () => {
        await personDetailsView.button_editSchulzuordnung.click();
        await page
          .getByTestId('person-details-card')
          .getByText(
            testschuleDstNr +
              ' (' +
              testschuleName +
              '): ' +
              nameRolle +
              ' (befristet bis ' +
              timeLimitTeacherRolle +
              ')'
          )
          .click();
      });

      await test.step(`Befristung im Bearbeitungsmodus öffnen`, async () => {
        await personDetailsView.buttonBefristungAendern.click();
        await expect(personDetailsView.radioButtonBefristungSchuljahresende).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristet).toBeVisible();
      });

      await test.step(`Ungültige und gültige Befristungen eingeben`, async () => {
        // enter invalid date
        await personDetailsView.inputBefristung.fill(
          await generateCurrentDate({ days: 0, months: 0, formatDMY: true })
        );
        await personDetailsView.errorTextInputBefristung.isVisible();

        await personDetailsView.inputBefristung.fill(
          await generateCurrentDate({ days: 0, months: -3, formatDMY: true })
        );
        await personDetailsView.errorTextInputBefristung.isVisible();

        // enter valid date
        await personDetailsView.inputBefristung.fill(
          await generateCurrentDate({ days: 22, months: 6, formatDMY: true })
        );
        await personDetailsView.errorTextInputBefristung.isHidden();

        timeLimitTeacherRolleNew = await generateCurrentDate({ days: 0, months: 8, formatDMY: true });
        await personDetailsView.inputBefristung.fill(timeLimitTeacherRolleNew);
        await personDetailsView.errorTextInputBefristung.isHidden();
      });

      await test.step(`Gültige Befristung speichern`, async () => {
        await personDetailsView.buttonBefristungAendernSubmit.click();
        await expect(
          page.getByText(
            'Möchten Sie die Befristung wirklich von ' +
              timeLimitTeacherRolle +
              ' in ' +
              timeLimitTeacherRolleNew +
              ' ändern?'
          )
        ).toBeVisible();
        await personDetailsView.buttonBefristungAendernConfirm.click();
      });

      await test.step(`In der Änderungsübersicht die Befristung der Rolle überprüfen und das Speichern final bestätigen`, async () => {
        await expect(
          page.getByRole('heading', { name: 'Bitte prüfen und abschließend speichern, um die Aktion auszuführen:' })
        ).toBeVisible();

        colorTextEntireNameSchulzuordnung = 'rgb(244, 67, 54)';
        await personDetailsView.validateEntireNameSchulzuordnung(
          testschuleDstNr,
          testschuleName,
          nameRolle,
          colorTextEntireNameSchulzuordnung,
          timeLimitTeacherRolle
        );

        colorTextEntireNameSchulzuordnung = 'rgb(76, 175, 80)';
        await personDetailsView.validateEntireNameSchulzuordnung(
          testschuleDstNr,
          testschuleName,
          nameRolle,
          colorTextEntireNameSchulzuordnung,
          timeLimitTeacherRolleNew
        );
        await personDetailsView.buttonBefristungAendernSave.click();
        await personDetailsView.buttonBefristungAendernSuccessClose.click();
        await personDetailsView.waitForAPIResponse({ lastEndpoint: 'organisationen/parents-by-ids' });
      });

      await test.step(`In der Gesamtübersicht überprüfen, dass die Schulzuordnung mit dem korrekten Datum angezeigt wird`, async () => {
        colorTextEntireNameSchulzuordnung = 'rgb(0, 30, 73)';
        await personDetailsView.validateEntireNameSchulzuordnung(
          testschuleDstNr,
          testschuleName,
          nameRolle,
          colorTextEntireNameSchulzuordnung,
          timeLimitTeacherRolleNew
        );
      });
    }
  );

  test(
    `Prüfen, dass eine Person mit einer befristeten Rolle wie z.B. LiV, nicht die Option 'Unbefristet' bekommen kann wenn man eine Befristung bearbeitet`,
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const nameRolle: string = await generateRolleName();

      await test.step(`Testdaten: Lehrer mit einer Rolle(LiV) mit den Merkmalen 'BefristungsPflicht', 'KopersPflicht' und einer Schulzuordnung über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          nameRolle,
          await generateKopersNr(),
          undefined,
          [befristungPflicht, kopersNrPflicht]
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`Schulzuordnung im Bearbeitungsmodus öffen`, async () => {
        await personDetailsView.button_editSchulzuordnung.click();
        await page
          .getByTestId('person-details-card')
          .getByText(testschuleDstNr + ' (' + testschuleName + '): ' + nameRolle + ' (befristet bis ')
          .click();
        await personDetailsView.waitForAPIResponse({ lastEndpoint: 'personenkontext-workflow/**' });
      });

      await test.step(`Befristung im Bearbeitungsmodus öffnen`, async () => {
        await personDetailsView.buttonBefristungAendern.click();
        await expect(personDetailsView.radioButtonBefristungSchuljahresende).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristet).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristetDisabled).toBeDisabled();
      });
    }
  );
});
