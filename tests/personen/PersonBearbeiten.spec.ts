import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { waitForAPIResponse } from '../../base/api/baseApi';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import {
  createPerson,
  createRolleAndPersonWithPersonenkontext,
  setTimeLimitPersonenkontext,
  UserInfo
} from '../../base/api/personApi';
import {
  addServiceProvidersToRolle,
  addSystemrechtToRolle,
  createRolle,
  RollenArt,
  RollenMerkmal,
} from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { klasse1Testschule } from '../../base/klassen';
import { befristungPflicht, kopersNrPflicht } from '../../base/merkmale';
import { landSH, testschule665Name, testschuleDstNr, testschuleName } from '../../base/organisation';
import { lehrerImVorbereitungsdienstRolle, lehrkraftOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler, typeSchuladmin } from '../../base/rollentypen';
import { email, itslearning } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { deleteKlasseByName, deletePersonenBySearchStrings, deleteRolleById } from '../../base/testHelperDeleteTestdata';
import { gotoTargetURL } from '../../base/testHelperUtils';
import {
  formatDateDMY,
  generateCurrentDate,
  generateKlassenname,
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { PersonDetailsViewPage } from '../../pages/admin/personen/PersonDetailsView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../../pages/components/Header.page';
import { MenuPage } from '../../pages/components/MenuBar.page';
import FromAnywhere from '../../pages/FromAnywhere';
import { LandingPage } from '../../pages/LandingView.page';
import { LoginPage } from '../../pages/LoginView.page';
import { StartPage } from '../../pages/StartView.page';

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

  test(
    'Befristung beim hinzufügen von Personenkontexten',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const unbefristeteRolle: string = lehrkraftOeffentlichRolle;
      const befristeteRolle: string = lehrerImVorbereitungsdienstRolle;
      logoutViaStartPage = true;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName()
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
    }
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schueler öffnen und Unsichtbarkeit des 2FA Abschnitts prüfen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoSchueler: UserInfo;

      await test.step(`Testdaten: Schüler mit einer Rolle(LERN) über die api anlegen ${ADMIN}`, async () => {
        const schuleId: string = await getOrganisationId(page, testschuleName);
        const klasseId: string = await getOrganisationId(page, klasse1Testschule);
        const rollenname: string = generateRolleName();
        const rolleId: string = await createRolle(page, 'LERN', schuleId, rollenname);
        await addServiceProvidersToRolle(page, rolleId, [await getServiceProviderId(page, 'itslearning')]);
        userInfoSchueler = await createPerson(
          page,
          schuleId,
          rolleId,
          generateNachname(),
          generateVorname(),
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      logoutViaStartPage = true;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName()
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const adminRollenart: RollenArt = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;
      logoutViaStartPage = true;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          adminOrganisation,
          adminRollenart,
          addminVorname,
          adminNachname,
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName()
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const organisation: string = landSH;
      const rollenart: RollenArt = 'SYSADMIN';

      let userInfoAdmin: UserInfo;
      logoutViaStartPage = true;

      await test.step(`Testdaten: Landesadmin mit einer Rolle(SYSADMIN) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          organisation,
          rollenart,
          addminVorname,
          adminNachname,
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName()
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const adminRollenart: RollenArt = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;
      logoutViaStartPage = true;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          adminOrganisation,
          adminRollenart,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName()
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName()
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

  test(
    'Inbetriebnahme-Passwort über die Gesamtübersicht erzeugen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName()
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const timeLimitTeacherRolle: string = formatDateDMY(generateCurrentDate({ days: 3, months: 5 }));
      let timeLimitTeacherRolleNew: string;
      const nameRolle: string = generateRolleName();
      let colorTextEntireNameSchulzuordnung: string = '';

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und einer Schulzuordnung über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          nameRolle
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer.personId,
          userInfoLehrer.organisationId,
          userInfoLehrer.rolleId,
          generateCurrentDate({ days: 3, months: 5 })
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
        await page
          .getByTestId('person-zuordnungen-section-edit')
          .getByTitle(testschuleName)
          .getByRole('checkbox')
          .click();
      });

      await test.step(`Befristung im Bearbeitungsmodus öffnen`, async () => {
        await personDetailsView.buttonBefristungAendern.click();
        await expect(personDetailsView.radioButtonBefristungSchuljahresende).toBeVisible();
        await expect(personDetailsView.radioButtonUnbefristet).toBeVisible();
      });

      await test.step(`Ungültige und gültige Befristungen eingeben`, async () => {
        // enter invalid date
        await personDetailsView.inputBefristung.fill(formatDateDMY(generateCurrentDate({ days: 0, months: 0 })));
        await personDetailsView.errorTextInputBefristung.isVisible();

        // enter invalid date
        await personDetailsView.inputBefristung.fill(formatDateDMY(generateCurrentDate({ days: 0, months: -3 })));
        await personDetailsView.errorTextInputBefristung.isVisible();

        // enter valid date
        await personDetailsView.inputBefristung.fill(formatDateDMY(generateCurrentDate({ days: 22, months: 6 })));
        await personDetailsView.errorTextInputBefristung.isHidden();

        timeLimitTeacherRolleNew = formatDateDMY(generateCurrentDate({ days: 0, months: 8 }));
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
          timeLimitTeacherRolle,
          'person-zuordnungen-section-edit'
        );

        colorTextEntireNameSchulzuordnung = 'rgb(76, 175, 80)';
        await personDetailsView.validateEntireNameSchulzuordnung(
          testschuleDstNr,
          testschuleName,
          nameRolle,
          colorTextEntireNameSchulzuordnung,
          timeLimitTeacherRolleNew,
          'person-zuordnungen-section-edit'
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
          timeLimitTeacherRolleNew,
          'person-zuordnungen-section-view'
        );
      });
    }
  );

  test(
    `Prüfen, dass eine Person mit einer befristeten Rolle wie z.B. LiV, nicht die Option 'Unbefristet' bekommen kann wenn man eine Befristung bearbeitet`,
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const nameRolle: string = generateRolleName();

      await test.step(`Testdaten: Lehrer mit einer Rolle(LiV) mit den Merkmalen 'BefristungsPflicht', 'KopersPflicht' und einer Schulzuordnung über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          nameRolle,
          generateKopersNr(),
          undefined,
          new Set<RollenMerkmal>([befristungPflicht, kopersNrPflicht])
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
          .getByTestId('person-zuordnungen-section-edit')
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
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const rolleName: string = generateRolleName();
      const klasseNameCurrent: string = generateKlassenname();
      const klasseNameNew: string = generateKlassenname();

      const userInfoSchueler: UserInfo = await test.step('Schüler mit Rolle und 2 Klassen anlegen', async () => {
        const idSchule: string = await getOrganisationId(page, testschuleName);
        const klasseIdCurrent: string = await createKlasse(page, idSchule, klasseNameCurrent);
        await createKlasse(page, idSchule, klasseNameNew);
        const userInfoSchueler: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, itslearning)],
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
        const labelText: string = `${testschuleDstNr} (${testschuleName}): ${rolleName} ${klasseNameCurrent}`;
        await page.locator(`label:has-text("${labelText}")`).click();
        await personDetailsView.buttonVersetzen.click();
        await personDetailsView.klassenVersetzen.searchByTitle(klasseNameNew, false);
        await page.getByTestId('klasse-change-submit-button').click();
        await expect(page.getByRole('dialog')).toContainText(
          `Wollen Sie den Schüler aus Klasse ${klasseNameCurrent} in Klasse ${klasseNameNew} versetzen?`
        );
        await page.getByTestId('confirm-change-klasse-button').click();
        await page.getByTestId('zuordnung-changes-save-button').click();
        await page.getByTestId('change-klasse-success-dialog-close-button').click();
      });

      await test.step('In der Gesamtübersicht prüfen, dass der Schüler in die neue Klasse versetzt worden ist', async () => {
        const expectedText: string = `${testschuleDstNr} (${testschuleName}): ${rolleName} ${klasseNameNew}`;
        await expect(page.locator('.text-body', { hasText: expectedText })).toBeVisible();
      });

      logoutViaStartPage = true;
    }
  );
});
