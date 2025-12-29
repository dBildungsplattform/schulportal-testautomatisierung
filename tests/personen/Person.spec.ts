import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { getOrganisationId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { addSystemrechtToRolle, createRolle, RollenArt } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import {
  ersatzLandSH,
  landSH,
  oeffentlichLandSH,
  testschuleDstNr,
  testschuleName,
} from '../../base/organisation';
import { landesadminRolle, schuelerRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler } from '../../base/rollentypen';
import { schulportaladmin } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById, deleteRolleByName } from '../../base/testHelperDeleteTestdata';
import { TestHelperLdap } from '../../base/testHelperLdap';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonCreationViewPage } from '../../pages/admin/personen/PersonCreationView.page';
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
const LDAP_URL: string = process.env.LDAP_URL;
const LDAP_ADMIN_PASSWORD: string = process.env.LDAP_ADMIN_PASSWORD;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let rolleNames: string[] = [];
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

      if (rolleNames.length > 0) {
        await deleteRolleByName(rolleNames, page);
        rolleNames = [];
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
    'Einen Benutzer mit der Rolle Lehrkraft anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const rolle: string = 'Lehrkraft';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      let einstiegspasswort: string = '';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Lehrer mit Kopers Nummer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname);
        await personCreationView.inputNachname.fill(nachname);
        await personCreationView.inputKopersnr.fill(kopersnr);
        await personCreationView.buttonPersonAnlegen.click();
        await expect(personCreationView.textSuccess).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable benutzername
        usernames.push(await personCreationView.dataBenutzername.innerText());
        einstiegspasswort = await personCreationView.inputEinstiegsPasswort.inputValue();
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
        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(usernames[0], einstiegspasswort);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
        await startseite.validateStartPageIsLoaded();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Einen Benutzer mit der Rolle Landesadmin anlegen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = 'Öffentliche Schulen Land Schleswig-Holstein';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        const startseite: StartPage = new StartPage(page);
        await startseite.checkSpIsVisible([schulportaladmin]);
        const menu: MenuPage = await startseite.goToAdministration();
        const personCreationView: PersonCreationViewPage = await menu.personAnlegen();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
        return personCreationView;
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.searchAndSelectOrganisation(schulstrukturknoten, true);
        await personCreationView.comboboxRolle.click();
        await page.getByText(landesadminRolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname);
        await personCreationView.inputNachname.fill(nachname);
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.textSuccess).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.dataRolle).toHaveText(landesadminRolle);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Einen Benutzer mit der Rolle LiV anlegen als Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const rolle: string = 'LiV';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.createUser(schulstrukturknoten, rolle, vorname, nachname, kopersnr);
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.textSuccess).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable usernames
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.dataRolle).toHaveText('LiV');
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden und einen weiteren Benutzer anlegen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
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
          generateRolleName()
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');

        usernames.push(userInfo.username);
        rolleIds.push(userInfo.rolleId);

        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePW();
        await startseite.validateStartPageIsLoaded();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Weiteren Nutzer anlegen`, async () => {
        const newVorname: string = generateVorname();
        const newNachname: string = generateNachname();
        const newKopersnr: string = generateKopersNr();
        const menu: MenuPage = await startseite.goToAdministration();
        const personCreationView: PersonCreationViewPage = await menu.personAnlegen();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(newVorname);
        await personCreationView.inputNachname.fill(newNachname);
        await personCreationView.inputKopersnr.fill(newKopersnr);
        await personCreationView.buttonPersonAnlegen.click();
        await expect(personCreationView.textSuccess).toBeVisible();

        // Save the username for cleanup
        usernames.push(await personCreationView.dataBenutzername.innerText());
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Einen Benutzer mit der Rolle Schueler anlegen als Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = testschuleName;
      const klasse: string = 'Playwright3a';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(schuelerRolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname);
        await personCreationView.inputNachname.fill(nachname);
        await personCreationView.comboboxKlasse.click();
        await page.getByText(klasse, { exact: true }).click();
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Prüfen dass der Benutzer mit der rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.textSuccess).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.dataRolle).toHaveText(schuelerRolle);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
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
        const startseite: StartPage = new StartPage(page);
        const menue: MenuPage = await startseite.goToAdministration();
        return await menue.personAnlegen();
      });

      await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationLand, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationOeffentlicheSchule, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationErsatzschule, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationSchule, false);
        await personCreationView.checkRolleModal(
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
          [landesadminRolle]
        );
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Lehrkraft anlegen und Ihren Kontext entfernen dann wieder hinzufügen und den LDAP Inhalt vollständig prüfen',
    { tag: [DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      let personDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
      const rolle: string = 'Lehrkraft';
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      const dienststellenNr: string = '1111111';
      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL, LDAP_ADMIN_PASSWORD);
      let createdBenutzername: string;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname);
        await personCreationView.inputNachname.fill(nachname);
        await personCreationView.inputKopersnr.fill(kopersnr);
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Auf Bestätigungsseite warten`, async () => {
        await expect(personCreationView.textH2PersonAnlegen).toBeVisible();
        usernames.push(await personCreationView.dataBenutzername.innerText());
        createdBenutzername = await personCreationView.dataBenutzername.innerText();
        await expect(personCreationView.buttonZurueckErgebnisliste).toBeVisible();
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
        await personCreationView.buttonOpenGesamtuebersicht.click();
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
    }
  );

  test(
    'Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite sowie den LDAP Inhalt vollständig prüfen',
    { tag: [DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const rolleNames: string[] = ['Lehrkraft'];
      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const kopersnr: string = generateKopersNr();
      const schulstrukturknoten: string = testschuleName;
      const dienststellenNr: string = '1111111';
      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL, LDAP_ADMIN_PASSWORD);
      let createdBenutzername: string;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.createUser(schulstrukturknoten, rolleNames[0], vorname, nachname, kopersnr);
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await personCreationView.validateConfirmationPage(
          vorname,
          nachname,
          rolleNames,
          testschuleDstNr,
          schulstrukturknoten
        );
        usernames.push(await personCreationView.dataBenutzername.innerText());
        createdBenutzername = await personCreationView.dataBenutzername.innerText();
        await expect(personCreationView.textDatenGespeichert).toBeVisible();
        await expect(personCreationView.labelVorname).toHaveText('Vorname:');
        await expect(personCreationView.dataVorname).toHaveText(vorname);
        await expect(personCreationView.labelNachname).toHaveText('Nachname:');
        await expect(personCreationView.dataNachname).toHaveText(nachname);
        await expect(personCreationView.labelBenutzername).toHaveText('Benutzername:');
        await expect(personCreationView.dataBenutzername).toContainText('tautopw');
        await expect(personCreationView.labelEinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.inputEinstiegsPasswort).toBeVisible();
        await expect(personCreationView.labelRolle).toHaveText('Rolle:');
        await expect(personCreationView.dataRolle).toContainText('Lehrkraft');
        await expect(personCreationView.labelOrganisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.dataOrganisationsebene).toHaveText(
          dienststellenNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.buttonWeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.buttonZurueckErgebnisliste).toBeVisible();
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
        await personCreationView.buttonOpenGesamtuebersicht.click();
        const personDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
        await expect(personDetailsView.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDetailsView.username).toHaveText(usernames[0]);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Mehrere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten LERN und LEHR und die Bestätigungsseiten vollständig prüfen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
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
          generateRolleName()
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

        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePW();
        currentUserIsLandesadministrator = false;
        await startseite.validateStartPageIsLoaded();
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
      });

      await test.step(`Benutzer Schüler anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(schuelerRolle, { exact: true }).click();
        // Click somewhere so that the dropdown role is closed and doesn't cover up the dropdown class
        await personCreationView.textH2PersonAnlegen.click();
        await personCreationView.comboboxKlasse.click();
        await page.getByText(klassenname).click();
        await personCreationView.inputVorname.fill(vorname1);
        await personCreationView.inputNachname.fill(nachname1);
        await personCreationView.inputVorname.click();
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Schüler prüfen`, async () => {
        await expect(personCreationView.textH2PersonAnlegen).toBeVisible();
        await expect(personCreationView.buttonSchliessen).toBeVisible();
        await expect(personCreationView.textSuccess).toHaveText(
          vorname1 + ' ' + nachname1 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.textDatenGespeichert).toBeVisible();
        await expect(personCreationView.labelVorname).toHaveText('Vorname:');
        await expect(personCreationView.dataVorname).toHaveText(vorname1);
        await expect(personCreationView.labelNachname).toHaveText('Nachname:');
        await expect(personCreationView.dataNachname).toHaveText(nachname1);
        await expect(personCreationView.labelBenutzername).toHaveText('Benutzername:');
        await expect(personCreationView.dataBenutzername).toContainText('tautopw');
        await expect(personCreationView.labelEinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.inputEinstiegsPasswort).toBeVisible();
        await expect(personCreationView.labelRolle).toHaveText('Rolle:');
        await expect(personCreationView.dataRolle).toHaveText(schuelerRolle);
        await expect(personCreationView.labelOrganisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.dataOrganisationsebene).toHaveText(
          testschuleDstNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.labelKlasse).toHaveText('Klasse:');
        await expect(personCreationView.dataKlasse).toHaveText(klassenname);
        await expect(personCreationView.buttonWeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.buttonZurueckErgebnisliste).toBeVisible();
      });

      await test.step(`Weiteren Benutzer Lehrer1 anlegen`, async () => {
        await personCreationView.buttonWeiterenBenutzerAnlegen.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle2, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname2);
        await personCreationView.inputNachname.fill(nachname2);
        await personCreationView.inputKopersnr.fill(kopersnr2);
        await personCreationView.inputVorname.click();
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Lehrer1 prüfen`, async () => {
        await expect(personCreationView.textH2PersonAnlegen).toBeVisible();
        await expect(personCreationView.buttonSchliessen).toBeVisible();
        await expect(personCreationView.textSuccess).toHaveText(
          vorname2 + ' ' + nachname2 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.textDatenGespeichert).toBeVisible();
        await expect(personCreationView.labelVorname).toHaveText('Vorname:');
        await expect(personCreationView.dataVorname).toHaveText(vorname2);
        await expect(personCreationView.labelNachname).toHaveText('Nachname:');
        await expect(personCreationView.dataNachname).toHaveText(nachname2);
        await expect(personCreationView.labelBenutzername).toHaveText('Benutzername:');
        await expect(personCreationView.dataBenutzername).toContainText('tautopw');
        await expect(personCreationView.labelEinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.inputEinstiegsPasswort).toBeVisible();
        await expect(personCreationView.labelRolle).toHaveText('Rolle:');
        await expect(personCreationView.dataRolle).toHaveText(rolle2);
        await expect(personCreationView.labelOrganisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.dataOrganisationsebene).toHaveText(
          testschuleDstNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.buttonWeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.buttonZurueckErgebnisliste).toBeVisible();
      });

      await test.step(`Weiteren Benutzer Lehrer2 anlegen`, async () => {
        await personCreationView.buttonWeiterenBenutzerAnlegen.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle3, { exact: true }).click();
        await personCreationView.inputVorname.fill(vorname3);
        await personCreationView.inputNachname.fill(nachname3);
        await personCreationView.inputKopersnr.fill(kopersnr3);
        await personCreationView.inputVorname.click();
        await personCreationView.buttonPersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Lehrer2 prüfen`, async () => {
        await expect(personCreationView.textH2PersonAnlegen).toBeVisible();
        await expect(personCreationView.buttonSchliessen).toBeVisible();
        await expect(personCreationView.textSuccess).toHaveText(
          vorname3 + ' ' + nachname3 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.dataBenutzername.innerText());
        await expect(personCreationView.textDatenGespeichert).toBeVisible();
        await expect(personCreationView.labelVorname).toHaveText('Vorname:');
        await expect(personCreationView.dataVorname).toHaveText(vorname3);
        await expect(personCreationView.labelNachname).toHaveText('Nachname:');
        await expect(personCreationView.dataNachname).toHaveText(nachname3);
        await expect(personCreationView.labelBenutzername).toHaveText('Benutzername:');
        await expect(personCreationView.dataBenutzername).toContainText('tautopw');
        await expect(personCreationView.labelEinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.inputEinstiegsPasswort).toBeVisible();
        await expect(personCreationView.labelRolle).toHaveText('Rolle:');
        await expect(personCreationView.dataRolle).toHaveText(rolle3);
        await expect(personCreationView.labelOrganisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.dataOrganisationsebene).toHaveText(
          testschuleDstNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.buttonWeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.buttonZurueckErgebnisliste).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
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
        const startseite: StartPage = new StartPage(page);
        const menue: MenuPage = await startseite.goToAdministration();
        return await menue.personAnlegen();
      });

      await test.step(`In der Combobox 'Organisation' eine Schule auswählen`, async () => {
        await personCreationView.searchAndSelectOrganisation(testschuleName, false);
      });

      await test.step(`In der Combobox 'Rolle' 2 Rollen vom Typ LEHR selektieren und prüfen, dass danach keine Rollen mehr vom Type LERN angezeigt werden in der Combobox`, async () => {
        await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[0], true);
        await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[1], true);
        await personCreationView.comboboxRolleInput.validateItemNotExists(rolleNames[2], true);
        await personCreationView.comboboxRolleInput.validateItemNotExists(rolleNames[3], true);
      });
      logoutViaStartPage = true;
    }
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
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = await startseite.goToAdministration();
      return await menue.personAnlegen();
    });

    await test.step(`In der Combobox 'Organisation' eine Schule auswählen`, async () => {
      await personCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
    });

    await test.step(`In der Combobox 'Rolle' 3 Rollen vom Typ LEHR selektieren`, async () => {
      await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[0], true);
      await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[1], true);
      await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[2], true);
    });

    await test.step(`Die restlichen Pflichfelder in dem Benutzer-Anlegen Dialog eingeben und speichern`, async () => {
      await personCreationView.inputVorname.fill(vorname);
      await personCreationView.inputNachname.fill(nachname);
      await personCreationView.buttonPersonAnlegen.click();
    });

    await test.step(`Auf der Bestätigungsseite prüfen, dass die 3 Rollen dem neuen Benutzer korrekt zugeordnet wurden`, async () => {
      await personCreationView.validateConfirmationPage(vorname, nachname, rolleNames, testschuleDstNr, testschuleName);
      usernames.push(await personCreationView.dataBenutzername.innerText());
    });
    logoutViaStartPage = true;
  });
});
