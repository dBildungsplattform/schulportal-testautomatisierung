import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { getOrganisationId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { addSystemrechtToRolle, createRolle } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { ersatzLandSH, landSH, oeffentlichLandSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuelerRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler } from '../../base/rollentypen';
import { DEV, STAGE } from '../../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById, deleteRolleByName } from '../../base/testHelperDeleteTestdata';
import { TestHelperLdap } from '../../base/testHelperLdap';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonCreationViewPage } from '../../pages/admin/personen/creation/PersonCreationView.neu.page';
import { PersonCreationSuccessPage } from '../../pages/admin/personen/creation/PersonCreationSuccess.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/PersonDetailsView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';
import { LandingPage } from '../../pages/LandingView.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

const LDAP_URL: string | undefined = process.env.LDAP_URL;
const LDAP_ADMIN_PASSWORD: string | undefined = process.env.LDAP_ADMIN_PASSWORD;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let rolleNames: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
    });
  });
  
  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);

      await header.logout();
      await loginAndNavigateToAdministration(page);
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

      if (rolleNames.length > 0) {
        await deleteRolleByName(rolleNames, page);
        rolleNames = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.logout();
    });
  });

  test(
    'Einen Benutzer mit der Rolle Lehrkraft anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartViewPage = new StartViewPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const menue: MenuBarPage = new MenuBarPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const rolle: string = 'Lehrkraft';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      let einstiegspasswort: string = '';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        return await menue.navigateToPersonCreation();
      });

      await test.step(`Lehrer mit Kopers Nummer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: [rolle], vorname, nachname, kopersnr });
        const successPage: PersonCreationSuccessPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable benutzername
        usernames.push(await successPage.getBenutzername());
        einstiegspasswort = await successPage.getEinstiegsPasswort();
      });

      await test.step(`In der Ergebnisliste prüfen dass der neue Benutzer ${nachname} angezeigt wird`, async () => {
        // Der Klick auf die Ergebnisliste funktioniert nicht zuverlaessig, darum der direkte Sprung in die Ergebnisliste via URL
        await page.goto('/' + 'admin/personen');
        await expect(personManagementView.textH2Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.inputSuchfeld.fill(nachname);
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: nachname, exact: true })).toBeVisible();
      });

      await test.step(`Der neue Benutzer meldet sich mit dem temporären Passwort am Portal an und vergibt ein neues Passwort`, async () => {
        await header.logout();
        await landing.buttonAnmelden.click();
        await login.login(usernames[0], einstiegspasswort);
        await login.updatePassword();
        currentUserIsLandesadministrator = false;
        await startseite.waitForPageLoad();
      });
    },
  );

  test(
    'Einen Benutzer mit der Rolle Landesadmin anlegen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = 'Öffentliche Schulen Land Schleswig-Holstein';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        const menu: MenuBarPage = new MenuBarPage(page);
        return await menu.navigateToPersonCreation();
      });

      let successPage: PersonCreationSuccessPage;

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: [landesadminRolle], vorname, nachname });
        successPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await successPage.getBenutzername());
        await expect(successPage.dataRolle).toHaveText(landesadminRolle);
      });
    },
  );

  test(
    'Einen Benutzer mit der Rolle LiV anlegen als Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const menue: MenuBarPage = new MenuBarPage(page);

      const rolle: string = 'LiV';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        return await menue.navigateToPersonCreation();
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: [rolle], vorname, nachname, kopersnr });
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        const successPage: PersonCreationSuccessPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable usernames
        usernames.push(await successPage.getBenutzername());
        await expect(successPage.dataRolle).toHaveText('LiV');
      });
    },
  );

  test(
    'Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden und einen weiteren Benutzer anlegen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartViewPage = new StartViewPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);

      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = testschuleName;
      const rolle: string = 'Lehrkraft';
      let userInfo: UserInfo;

      await test.step(`Schuladmin anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];
        userInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          schulstrukturknoten,
          'LEIT',
          nachname,
          vorname,
          idSPs,
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');

        usernames.push(userInfo.username);
        rolleIds.push(userInfo.rolleId);

        await header.logout();
        await landing.buttonAnmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePassword();
        await startseite.waitForPageLoad();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Weiteren Nutzer anlegen`, async () => {
        const newVorname: string = generateVorname();
        const newNachname: string = generateNachname();
        const newKopersnr: string = generateKopersNr();
        const newStartPage: StartViewPage = new StartViewPage(page);
        await newStartPage.navigateToAdministration();
        const menu: MenuBarPage = new MenuBarPage(page);
        const personCreationView: PersonCreationViewPage = await menu.navigateToPersonCreation();
        await personCreationView.fillForm({ rollen: [rolle], vorname: newVorname, nachname: newNachname, kopersnr: newKopersnr });
        const successPage: PersonCreationSuccessPage = await personCreationView.submit();
        await successPage.waitForPageLoad();

        // Save the username for cleanup
        usernames.push(await successPage.getBenutzername());
      });
    },
  );

  test(
    'Einen Benutzer mit der Rolle Schueler anlegen als Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const menue: MenuBarPage = new MenuBarPage(page);

      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = testschuleName;
      const klasse: string = 'Playwright3a';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        return await menue.navigateToPersonCreation();
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: [schuelerRolle], vorname, nachname, klasse });
      });

      await test.step(`Prüfen dass der Benutzer mit der rolle Landesadmin angelegt wurde`, async () => {
        const successPage: PersonCreationSuccessPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await successPage.getBenutzername());
        await expect(successPage.dataRolle).toHaveText(schuelerRolle);
      });
    },
  );

  test(
    "Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin",
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const OrganisationLand: string = landSH;
      const OrganisationOeffentlicheSchule: string = oeffentlichLandSH;
      const OrganisationErsatzschule: string = ersatzLandSH;
      const OrganisationSchule: string = testschuleName;

      const rolleLehr: string = 'Lehrkraft';
      const rolleLiV: string = 'LiV';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        const menu: MenuBarPage = new MenuBarPage(page);
        return await menu.navigateToPersonCreation();
      });

      await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchOrganisation(OrganisationLand, true);
        await personCreationView.assertAvailableRollen(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
        );
        await personCreationView.clearOrganisation();
      });

      await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchOrganisation(OrganisationOeffentlicheSchule, true);
        await personCreationView.assertAvailableRollen(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
        );
        await personCreationView.clearOrganisation();
      });

      await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchOrganisation(OrganisationErsatzschule, true);
        await personCreationView.assertAvailableRollen(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
        );
        await personCreationView.clearOrganisation();
      });

      await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchOrganisation(OrganisationSchule, false);
        await personCreationView.assertAvailableRollen(
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
          [landesadminRolle],
        );
      });
    },
  );

  test(
    'Eine Lehrkraft anlegen und Ihren Kontext entfernen dann wieder hinzufügen und den LDAP Inhalt vollständig prüfen',
    { tag: [DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      test.slow();

      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      let personDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
      const rolle: string = 'Lehrkraft';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      const dienststellenNr: string = '1111111';
      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL!, LDAP_ADMIN_PASSWORD!);
      let createdBenutzername: string;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
        await personCreationView.waitForPageLoad();
      });

      let successPage: PersonCreationSuccessPage;

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: [rolle], vorname, nachname, kopersnr });
        successPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
      });

      await test.step(`Auf Bestätigungsseite warten`, async () => {
        usernames.push(await successPage.getBenutzername());
        createdBenutzername = await successPage.getBenutzername();
        await expect(successPage.buttonBackToList).toBeVisible();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP angelegt wurde`, async () => {
        expect(await testHelperLdap.validateUserExists(createdBenutzername, 10, 1000)).toBeTruthy();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP korrekter Gruppe zugeordnet wurde`, async () => {
        expect(await testHelperLdap.validateUserIsInGroupOfNames(createdBenutzername, dienststellenNr)).toBeTruthy();
      });

      let generatedMailPrimaryAddress: string | null = null;
      await test.step(`Mail Primary Address Auf Existenz Prüfen`, async () => {
        generatedMailPrimaryAddress = await testHelperLdap.getMailPrimaryAddress(createdBenutzername, 10, 1000);
        expect(generatedMailPrimaryAddress).toContain('schule-sh.de');
        expect(generatedMailPrimaryAddress.length).toBeGreaterThan(5);
      });

      await test.step(`Dialog Gesamtübersicht öffnen`, async () => {
        await successPage.navigateToPersonDetails();
      });

      await test.step(`Schulzuordnung entfernen`, async () => {
        await personDetailsView.buttonEditSchulzuordnung.click();
        await page.locator('div.v-selection-control__input').click();
        await personDetailsView.button_deleteSchulzuordnung.click();
        await personDetailsView.button_confirmDeleteSchulzuordnung.click();
        await personDetailsView.buttonSaveAssignmentChanges.click();
        await personDetailsView.button_closeZuordnungSuccess.click();
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      await personManagementView.waitForData();
      personDetailsView = await test.step(`Kontextlose Person suchen und Gesamtübersicht öffnen`, async () => {
        await personManagementView.searchBySuchfeld(createdBenutzername);
        return await personManagementView.openGesamtuebersichtPerson(page, createdBenutzername);
      });

      await test.step(`Schulzuordnung wieder hinzufügen`, async () => {
        await personDetailsView.buttonEditSchulzuordnung.click();
        await personDetailsView.buttonAddSchulzuordnung.click();
      });

      await personDetailsView.organisationen.searchByTitle(schulstrukturknoten, false);
      await personDetailsView.comboboxRolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await personDetailsView.buttonSubmitAddSchulzuordnung.click();
      await personDetailsView.buttonConfirmZuordnungDialogAddition.click();
      await personDetailsView.buttonSaveAssignmentChanges.click();
      await personDetailsView.buttonCloseSaveAssignmentChanges.click();

      await test.step(`Prüfen, dass Lehrkraft im LDAP noch existiert`, async () => {
        expect(await testHelperLdap.validateUserExists(createdBenutzername, 10, 1000)).toBeTruthy();
      });

      await test.step(`Prüfen, dass Lehrkraft noch im LDAP korrekter Gruppe zugeordnet ist`, async () => {
        expect(await testHelperLdap.validateUserIsInGroupOfNames(createdBenutzername, dienststellenNr)).toBeTruthy();
      });

      await test.step(`Prüfen, dass eine Mail weiterhin existiert und zugeordnet ist`, async () => {
        const mailPrimaryAddress: string = await testHelperLdap.getMailPrimaryAddress(createdBenutzername);
        expect(mailPrimaryAddress).toContain('schule-sh.de');
        expect(mailPrimaryAddress.length).toBeGreaterThan(5);
      });
    },
  );

  test(
    'Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite sowie den LDAP Inhalt vollständig prüfen',
    { tag: [DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      test.slow();

      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const rolleNames: string[] = ['Lehrkraft'];
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      const dienststellenNr: string = '1111111';
      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL!, LDAP_ADMIN_PASSWORD!);
      let createdBenutzername: string;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
        await personCreationView.waitForPageLoad();
      });

      let successPage: PersonCreationSuccessPage;

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.fillForm({ organisation: schulstrukturknoten, rollen: rolleNames, vorname, nachname, kopersnr });
        successPage = await personCreationView.submit();
        await successPage.waitForPageLoad();
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await successPage.assertSuccessfulCreation({ organisation: schulstrukturknoten, rollen: rolleNames, vorname, nachname, kopersnr, dstNr: testschuleDstNr });
        usernames.push(await successPage.getBenutzername());
        createdBenutzername = await successPage.getBenutzername();
        await successPage.assertNavigationButtonsVisible();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP angelegt wurde`, async () => {
        expect(await testHelperLdap.validateUserExists(createdBenutzername, 10, 1000)).toBeTruthy();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP korrekter Gruppe zugeordnet wurde`, async () => {
        expect(await testHelperLdap.validateUserIsInGroupOfNames(createdBenutzername, dienststellenNr)).toBeTruthy();
      });

      await test.step(`Mail Primary Address Auf Existenz Prüfen`, async () => {
        const mailPrimaryAddress: string = await testHelperLdap.getMailPrimaryAddress(createdBenutzername, 10, 1000);
        expect(mailPrimaryAddress).toContain('schule-sh.de');
        expect(mailPrimaryAddress.length).toBeGreaterThan(5);
      });

      await test.step(`Auf die Gesamtübersicht des neu angelegten Benutzers mit dem Button "Zur Gesamtuebersicht" navigieren`, async () => {
        await successPage.navigateToPersonDetails();
        const personDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
        await expect(personDetailsView.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDetailsView.username).toHaveText(usernames[0]);
      });
    },
  );

  test(
    'Mehrere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten LERN und LEHR und die Bestätigungsseiten vollständig prüfen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartViewPage = new StartViewPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      let userInfo: UserInfo;

      await test.step(`Testdaten: Landesadmin anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];
        userInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          landSH,
          'SYSADMIN',
          generateNachname(),
          generateVorname(),
          idSPs,
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'ROLLEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'KLASSEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULTRAEGER_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(userInfo.username);
        rolleIds.push(userInfo.rolleId);

        await header.logout();
        await landing.buttonAnmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePassword();
        currentUserIsLandesadministrator = false;
        await startseite.waitForPageLoad();
        const newStartPage: StartViewPage = new StartViewPage(page);
        await newStartPage.navigateToAdministration();
      });

      // Testdaten
      const schulstrukturknoten: string = testschuleName;
      const vorname1: string = generateVorname();
      const nachname1: string = generateNachname();
      const klassenname: string = 'Playwright3a';

      const rolle2: string = 'Lehrkraft';
      const vorname2: string = generateVorname();
      const nachname2: string = generateNachname();
      const kopersnr2: string = generateKopersNr();

      const rolle3: string = 'Lehrkraft';
      const vorname3: string = generateVorname();
      const nachname3: string = generateNachname();
      const kopersnr3: string = generateKopersNr();

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
        await personCreationView.waitForPageLoad();
      });

      interface UserCreationData {
        rolle: string;
        vorname: string;
        nachname: string;
        klasse: string | undefined;
        kopersnr: string | undefined;
      }
      const users: UserCreationData[] = [
        { rolle: schuelerRolle, vorname: vorname1, nachname: nachname1, klasse: klassenname, kopersnr: undefined },
        { rolle: rolle2, vorname: vorname2, nachname: nachname2, klasse: undefined, kopersnr: kopersnr2 },
        { rolle: rolle3, vorname: vorname3, nachname: nachname3, klasse: undefined, kopersnr: kopersnr3 },
      ];

      let currentCreationView: PersonCreationViewPage = personCreationView;

      for (let i: number = 0; i < users.length; i++) {
        const user: UserCreationData = users[i];
        await currentCreationView.fillForm({
          organisation: schulstrukturknoten,
          rollen: [user.rolle],
          vorname: user.vorname,
          nachname: user.nachname,
          klasse: user.klasse,
          kopersnr: user.kopersnr,
        });
        const successPage: PersonCreationSuccessPage = await currentCreationView.submit();
        await successPage.assertSuccessfulCreation({
          organisation: schulstrukturknoten,
          rollen: [user.rolle],
          vorname: user.vorname,
          nachname: user.nachname,
          klasse: user.klasse,
          kopersnr: user.kopersnr,
          dstNr: testschuleDstNr,
        });
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await successPage.getBenutzername());
        if (i < users.length - 1) {
          currentCreationView = await successPage.navigateToCreateAnother();
        }
      }
    }
  );

  test(
    `Bei Nutzerneuanlage prüfen, dass die combobox 'Rolle' nach Auswahl einer Rolle, nur noch Rollen der gleichen Rollenart angeboten werden`,
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const rolleNames: string[] = [];

      await test.step(`Testdaten: Je 2 Rollen mit Rollenarten LEHR und LERN über die api anlegen`, async () => {
        const idSchule: string = await getOrganisationId(page, testschuleName);

        for (let i: number = 0; i <= 4; i++) {
          rolleNames.push(generateRolleName());
        }

        rolleIds.push(await createRolle(page, typeLehrer, idSchule, rolleNames[0]));
        rolleIds.push(await createRolle(page, typeLehrer, idSchule, rolleNames[1]));
        rolleIds.push(await createRolle(page, typeSchueler, idSchule, rolleNames[2]));
        rolleIds.push(await createRolle(page, typeSchueler, idSchule, rolleNames[3]));
      });

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog "Person anlegen" öffnen`, async () => {
        const menu: MenuBarPage = new MenuBarPage(page);
        return await menu.navigateToPersonCreation();
      });

      await test.step(`In der Combobox 'Organisation' eine Schule auswählen`, async () => {
        await personCreationView.searchOrganisation(testschuleName, false);
      });

      await test.step(`In der Combobox 'Rolle' 2 Rollen vom Typ LEHR selektieren und prüfen, dass danach keine Rollen mehr vom Type LERN angezeigt werden in der Combobox`, async () => {
        await personCreationView.addRolle(rolleNames[0]);
        await personCreationView.addRolle(rolleNames[1]);
        await personCreationView.assertAvailableRollen([], [rolleNames[2], rolleNames[3]]);
      });
    },
  );

  test(`Neuen Benutzer mit mehreren Rollen anlegen`, { tag: [STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
    const rolleNames: string[] = [];
    const vorname: string = generateVorname();
    const nachname: string = generateNachname();

    await test.step(`Testdaten: 3 Rollen mit Rollenarten LEHR über die api anlegen`, async () => {
      const idLandSH: string = await getOrganisationId(page, landSH);

      for (let i: number = 0; i <= 2; i++) {
        rolleNames.push(generateRolleName());
      }

      rolleIds.push(await createRolle(page, typeLehrer, idLandSH, rolleNames[0]));
      rolleIds.push(await createRolle(page, typeLehrer, idLandSH, rolleNames[1]));
      rolleIds.push(await createRolle(page, typeLehrer, idLandSH, rolleNames[2]));
    });

    const personCreationView: PersonCreationViewPage = await test.step(`Dialog "Person anlegen" öffnen`, async () => {
        const menu: MenuBarPage = new MenuBarPage(page);
        return await menu.navigateToPersonCreation();
    });

    await test.step(`Formular ausfüllen und speichern`, async () => {
      await personCreationView.fillForm({ organisation: testschuleName, rollen: rolleNames, vorname, nachname });
    });

    await test.step(`Auf der Bestätigungsseite prüfen, dass die 3 Rollen dem neuen Benutzer korrekt zugeordnet wurden`, async () => {
      const successPage: PersonCreationSuccessPage = await personCreationView.submit();
      await successPage.assertSuccessfulCreation({ organisation: testschuleName, rollen: rolleNames, vorname, nachname, dstNr: testschuleDstNr });
      usernames.push(await successPage.getBenutzername());
    });
  });
});
