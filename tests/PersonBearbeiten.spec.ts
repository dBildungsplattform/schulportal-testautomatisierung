import { expect, test, PlaywrightTestArgs } from '@playwright/test';
import { createPerson, createRolleAndPersonWithUserContext, setTimeLimitPersonenkontext } from '../base/api/testHelperPerson.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { UserInfo, waitForAPIResponse } from '../base/api/testHelper.page';
import { createKlasse, getOrganisationId } from '../base/api/testHelperOrganisation.page';
import { addSPToRolle, addSystemrechtToRolle, createRolle } from '../base/api/testHelperRolle.page';
import { LONG, SHORT, STAGE, BROWSER } from '../base/tags';
import { deleteKlasseByName, deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { typeLehrer, typeSchueler, typeSchuladmin } from '../base/rollentypen';
import { landSH, testschuleName, testschuleDstNr, testschule665Name } from '../base/organisation';
import { email, itslearning } from '../base/sp';
import {
  generateKlassenname,
  generateNachname,
  generateVorname,
  generateRolleName,
  generateKopersNr,
} from '../base/testHelperGenerateTestdataNames';
import { generateCurrentDate, gotoTargetURL } from '../base/testHelperUtils';
import { lehrkraftOeffentlichRolle, lehrkraftInVertretungRolle } from '../base/rollen';
import { klasse1Testschule } from '../base/klassen';
import { befristungPflicht, kopersNrPflicht } from '../base/merkmale';
import { PersonDetailsViewPage } from '../pages/admin/personen/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/components/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/components/MenuBar.page';
import { StartPage } from '../pages/StartView.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let klasseNames: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
const currentUserIsLandesadministrator: boolean = true;
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
      await landing.buttonAnmelden.click();
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

      if (klasseNames.length > 0) {
        await deleteKlasseByName(klasseNames, page);
        klasseNames = [];
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

  test('Befristung beim hinzufügen von Personenkontexten', { tag: [LONG] }, async ({ page }: PlaywrightTestArgs) => {
    let userInfoLehrer: UserInfo;
    const unbefristeteRolle: string = lehrkraftOeffentlichRolle;
    const befristeteRolle: string = lehrkraftInVertretungRolle;
    logoutViaStartPage = true;

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
      await personDetailsView.waitForPageToBeLoaded();
      await personDetailsView.buttonEditSchulzuordnung.click();
      await personDetailsView.buttonAddSchulzuordnung.click();
      await personDetailsView.organisationen.searchByTitle(testschuleName, false);
    });

    await test.step(`Befristung bei ${unbefristeteRolle} und ${befristeteRolle} überprüfen`, async () => {
      await personDetailsView.rollen.selectByTitle(befristeteRolle);
      await expect(personDetailsView.buttonBefristetSchuljahresende).toBeChecked();
      await personDetailsView.rollen.clear();
      await personDetailsView.rollen.selectByTitle(unbefristeteRolle);
      await expect(personDetailsView.buttonBefristungUnbefristet).toBeChecked();
    });
  });

  test(
    'Einen Benutzer über das FE unbefristet sperren',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const sperrDatumAbHeute: string = await generateCurrentDate({ days: 0, months: 0, formatDMY: true });
      logoutViaStartPage = true;

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
    }
  );

  test('Einen Benutzer über das FE befristet sperren', { tag: [LONG, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    let userInfoLehrer: UserInfo;
    const sperrDatumAbHeute: string = await generateCurrentDate({ days: 0, months: 0, formatDMY: true });
    const sperrDatumBis: string = await generateCurrentDate({ days: 5, months: 2, formatDMY: true });
    logoutViaStartPage = true;

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
  });

  test(
    'Gesamtübersicht für einen Benutzer als Schueler öffnen und Unsichtbarkeit des 2FA Abschnitts prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoSchueler: UserInfo;

      await test.step(`Testdaten: Schüler mit einer Rolle(LERN) über die api anlegen ${ADMIN}`, async () => {
        const schuleId: string = await getOrganisationId(page, testschuleName);
        const klasseId: string = await getOrganisationId(page, klasse1Testschule);
        const rollenname: string = await generateRolleName();
        const rolleId: string = await createRolle(page, 'LERN', schuleId, rollenname);
        await addSPToRolle(page, rolleId, [await getSPId(page, 'itslearning')]);
        userInfoSchueler = await createPerson(
          page,
          await generateNachname(),
          await generateVorname(),
          schuleId,
          rolleId,
          '',
          klasseId
        );
        usernames.push(userInfoSchueler.username);
        rolleIds.push(userInfoSchueler.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoSchueler.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoSchueler.username);
      });

      await test.step(`Gesamtübersicht Abschnitte prüfen`, async () => {
        await expect(personDetailsView.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDetailsView.textH3PasswortHeadline).toBeVisible();
        await expect(personDetailsView.textH3SchulzuordnungHeadline).toBeVisible();
        await expect(personDetailsView.textH3LockPersonHeadline).toBeVisible();
      });

      await test.step(`Unsichtbarkeit des 2FA Abschnitts prüfen`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeHidden();
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeHidden();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeHidden();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeHidden();
        await expect(personDetailsView.button2FAEinrichten).toBeHidden();
      });
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Lehrkraft öffnen und 2FA Status prüfen dass kein Token eingerichtet ist',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      logoutViaStartPage = true;

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
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeVisible();
      });
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
      logoutViaStartPage = true;

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
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeVisible();
      });
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
      logoutViaStartPage = true;

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
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schuladmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const adminRollenart: string = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;
      logoutViaStartPage = true;

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
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
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
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  // TODO: we skip this test because it fails, as ldap is currently unreachable in CI
  test.skip(
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
        await personDetailsView.buttonEditSchulzuordnung.click();
        await page.getByTestId('person-details-card').getByTitle(testschuleName).getByRole('checkbox').click();
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

        // enter invalid date
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
        await waitForAPIResponse(page, 'organisationen/parents-by-ids');
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
        await personDetailsView.buttonEditSchulzuordnung.click();
        await page
          .getByTestId('person-details-card')
          .getByText(testschuleDstNr + ' (' + testschuleName + '): ' + nameRolle + ' (befristet bis ')
          .click();
        await waitForAPIResponse(page, 'personenkontext-workflow/**');
      });

      await test.step(`Befristung im Bearbeitungsmodus öffnen`, async () => {
        await personDetailsView.buttonBefristungAendern.click();
        await expect(personDetailsView.radioButtonBefristungSchuljahresende).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristet).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristetDisabled).toBeDisabled();
      });
    }
  );

  test(
    'Einen Schüler von einer Klasse in eine Andere versetzen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const rolleName: string = await generateRolleName();
      const klasseNameCurrent: string = await generateKlassenname();
      const klasseNameNew: string = await generateKlassenname();

      const userInfoSchueler: UserInfo = await test.step('Schüler mit Rolle und 2 Klassen anlegen', async () => {
        const idSchule: string = await getOrganisationId(page, testschuleName);
        const klasseIdCurrent: string = await createKlasse(page, idSchule, klasseNameCurrent);
        await createKlasse(page, idSchule, klasseNameNew);
        const userInfoSchueler: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeSchueler,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, itslearning)],
          rolleName,
          undefined,
          klasseIdCurrent
        );
        usernames.push(userInfoSchueler.username);
        rolleIds.push(userInfoSchueler.rolleId);
        klasseNames.push(klasseNameCurrent, klasseNameNew);
        return userInfoSchueler;
      });

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht Schüler öffnen `, async () => {
        const startPage: StartPage = new StartPage(page);
        const personManagementView: PersonManagementViewPage = await startPage
          .goToAdministration()
          .then((menu: MenuPage) => menu.goToBenutzerAnzeigen());
        await personManagementView.searchBySuchfeld(userInfoSchueler.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoSchueler.username);
      });

      await test.step('Schüler versetzen', async () => {
        await personDetailsView.buttonEditSchulzuordnung.click();
        await page
          .getByTestId('person-details-card')
          .getByText(testschuleDstNr + ' (' + testschuleName + '): ' + rolleName + ' ' + klasseNameCurrent)
          .click();
        await personDetailsView.buttonVersetzen.click();
        await personDetailsView.klassenVersetzen.searchByTitle(klasseNameNew, false);
        await page.getByTestId('klasse-change-submit-button').click();
        await expect(page.getByRole('dialog')).toContainText(
          `Wollen Sie den Schüler aus Klasse ${klasseNameCurrent} in Klasse ${klasseNameNew} versetzen?`
        );
        await page.getByTestId('confirm-change-klasse-button').click();
        await page.getByTestId('zuordnung-changes-save-button').click();
        await page.getByTestId('change-klasse-success-close').click();
      });

      await test.step('In der Gesamtübersicht prüfen, dass der Schüler in die neue Klasse versetzt worden ist', async () => {
        await expect(
          page
            .getByTestId('person-details-card')
            .getByText(testschuleDstNr + ' (' + testschuleName + '): ' + rolleName + ' ' + klasseNameNew)
        ).toBeVisible();
      });

      logoutViaStartPage = true;
    }
  );
});
