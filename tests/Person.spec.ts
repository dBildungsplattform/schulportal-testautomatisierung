import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { UserInfo, waitForAPIResponse } from '../base/api/testHelper.page';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { addSystemrechtToRolle, createRolle } from '../base/api/testHelperRolle.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import {
  landSH,
  testschuleName,
  testschule665Name,
  oeffentlichLandSH,
  ersatzLandSH,
  testschuleDstNr,
} from '../base/organisation.ts';
import { landesadminRolle, schuelerRolle, schuladminOeffentlichRolle } from '../base/rollen.ts';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById, deleteRolleByName } from '../base/testHelperDeleteTestdata.ts';
import {
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/testHelperGenerateTestdataNames.ts';
import { gotoTargetURL } from '../base/testHelperUtils.ts';
import { PersonCreationViewPage } from '../pages/admin/PersonCreationView.page';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { HeaderPage } from '../pages/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { StartPage } from '../pages/StartView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { typeLehrer, typeSchueler } from '../base/rollentypen.ts';
import { getOrganisationId } from '../base/api/testHelperOrganisation.page.ts';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

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
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const rolle: string = 'Lehrkraft';
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
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
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const schulstrukturknoten: string = 'Öffentliche Schulen Land Schleswig-Holstein';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, true);
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
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const rolle: string = 'LiV';
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
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
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const schulstrukturknoten: string = testschuleName;
      const rolle: string = 'Lehrkraft';
      let userInfo: UserInfo;

      // Step 1:  Create a Schuladmin as Landesadmin and login as the newly created Schuladmin user
      await test.step(`Schuladmin anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
        userInfo = await createRolleAndPersonWithUserContext(
          page,
          schulstrukturknoten,
          'LEIT',
          nachname,
          vorname,
          idSPs,
          await generateRolleName()
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

      // Step 2: Create another user as Schuladmin
      await test.step(`Schuladmin anlegen und mit diesem anmelden`, async () => {
        const newVorname: string = await generateVorname();
        const newNachname: string = await generateNachname();
        const newKopersnr: string = await generateKopersNr();

        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await waitForAPIResponse(page, 'dbiam/personenuebersicht')
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
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
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
    'Ergebnisliste Benutzer auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      await test.step(`Benutzerverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemAlleBenutzerAnzeigen.click();
        await personManagementView.waitForData();
        await expect(personManagementView.textH1Administrationsbereich).toBeVisible();
        await expect(personManagementView.textH2Benutzerverwaltung).toBeVisible();
        await expect(personManagementView.textH2Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await expect(personManagementView.inputSuchfeld).toBeVisible();
        await expect(personManagementView.buttonSuchen).toBeVisible();
        await expect(personManagementView.tableHeaderNachname).toBeVisible();
        await expect(personManagementView.tableHeaderVorname).toBeVisible();
        await expect(personManagementView.tableHeaderBenutzername).toBeVisible();
        await expect(personManagementView.tableHeaderKopersNr).toBeVisible();
        await expect(personManagementView.tableHeaderRolle).toBeVisible();
        await expect(personManagementView.tableHeaderZuordnungen).toBeVisible();
        await expect(personManagementView.tableHeaderKlasse).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    "Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin",
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const OrganisationLand: string = landSH;
      const OrganisationOeffentlicheSchule: string = oeffentlichLandSH;
      const OrganisationErsatzschule: string = ersatzLandSH;
      const OrganisationSchule: string = testschuleName;

      const rolleLehr: string = 'Lehrkraft';
      const rolleLiV: string = 'LiV';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemBenutzerAnlegen.click();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(OrganisationLand, true);
        await personCreationView.comboboxRolle.click();
        await expect(personCreationView.listboxRolle).toContainText(landesadminRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listboxRolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.textH2PersonAnlegen.click();
      });

      await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.comboboxSchulstrukturknotenClear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(OrganisationOeffentlicheSchule, true);
        await personCreationView.comboboxRolle.click();
        await expect(personCreationView.listboxRolle).toContainText(landesadminRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listboxRolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.textH2PersonAnlegen.click();
      });

      await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.comboboxSchulstrukturknotenClear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(OrganisationErsatzschule, true);
        await personCreationView.comboboxRolle.click();
        await expect(personCreationView.listboxRolle).toContainText(landesadminRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listboxRolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listboxRolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.textH2PersonAnlegen.click();
      });

      await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.comboboxSchulstrukturknotenClear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(OrganisationSchule, false);
        await personCreationView.comboboxRolle.click();
        await expect(personCreationView.listboxRolle).toContainText(rolleLehr);
        await expect(personCreationView.listboxRolle).toContainText(rolleLiV);
        await expect(personCreationView.listboxRolle).toContainText(schuelerRolle);
        await expect(personCreationView.listboxRolle).not.toContainText(landesadminRolle);
        await page.keyboard.type(schuladminOeffentlichRolle);
        await expect(personCreationView.listboxRolle).toContainText(schuladminOeffentlichRolle);
        // close opened combobox organisation
        await personCreationView.textH2PersonAnlegen.click();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'In der Ergebnisliste die Suchfunktion ausführen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const rolle: string = 'Lehrkraft';
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
      const schulstrukturknoten: string = testschuleName;

      await test.step(`Benutzer Lehrkraft anlegen`, async () => {
        await page.goto('/' + 'admin/personen/new');
        await personCreationView.createUser(schulstrukturknoten, rolle, vorname, nachname, kopersnr);
        await expect(personCreationView.textSuccess).toBeVisible();
        usernames.push(await personCreationView.dataBenutzername.innerText());
      });

      await test.step(`Benutzerverwaltung öffnen und Suche nach Vornamen `, async () => {
        await page.goto('/' + 'admin/personen');
        await expect(personManagementView.textH2Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.inputSuchfeld.fill(vorname);
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: vorname })).toBeVisible();
      });

      await test.step(`Suche nach Nachnamen `, async () => {
        await personManagementView.inputSuchfeld.fill(nachname);
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: nachname })).toBeVisible();
      });

      await test.step(`Suche nach Benutzernamen `, async () => {
        await personManagementView.inputSuchfeld.fill(usernames[0]);
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: nachname })).toBeVisible();
      });

      await test.step(`Suche nach Dienststellennummer `, async () => {
        await personManagementView.inputSuchfeld.fill('0056357');
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: 'ssuperadmin', exact: true })).toBeVisible();
      });

      await test.step(`Suche mit leerer Ergebnisliste. Gepüft wird das der Text "Keine Daten gefunden." gefunden wird, danach wird gepüft dass die Tabelle 0 Zeilen hat.`, async () => {
        await personManagementView.inputSuchfeld.fill('!§$%aavvccdd44xx@');
        await personManagementView.buttonSuchen.click();
        await expect(page.getByRole('cell', { name: 'Keine Daten gefunden.' })).toBeVisible();
        await expect(page.locator('v-data-table__td')).toHaveCount(0);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'In der Ergebnisliste die Filterfunktion der Schulen benutzen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      await test.step(`Filter öffnen und Schule selektieren`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await expect(personManagementView.textH2Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.waitForData();

        // Fill the input with the name of the Schule and let the autocomplete find it
        await personManagementView.comboboxMenuIconSchuleInput.fill(testschule665Name);

        // Click on the found Schule
        await page.getByRole('option', { name: testschule665Name }).click();

        // Close the dropdown
        await personManagementView.comboboxMenuIconSchule.click();

        // Click elsewhere on the page to fully confirm the selected Schule
        await personManagementView.buttonSuchen.click();

        await expect(page.getByTestId('schule-select')).toHaveText('1111165 (Testschule-PW665)');

        await expect(personManagementView.getRows().first()).toContainText('1111165');
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite vollständig prüfen',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const rolleNames: string[] = ['Lehrkraft'];
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
      const schulstrukturknoten: string = testschuleName;

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
      });

      await test.step(`Auf die Gesamtübersicht des neu angelegten Benutzers mit dem Button "Zur Gesamtuebersicht" navigieren`, async () => {
        await personCreationView.buttonOpenGesamtuebersicht.click();
        const personDeatilsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
        await expect(personDeatilsView.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDeatilsView.username).toHaveText(usernames[0]);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Mehrere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten LERN und LEHR und die Bestätigungsseiten vollständig prüfen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      let userInfo: UserInfo;

      await test.step(`Testdaten: Landesadmin anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
        userInfo = await createRolleAndPersonWithUserContext(
          page,
          landSH,
          'SYSADMIN',
          await generateNachname(),
          await generateVorname(),
          idSPs,
          await generateRolleName()
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
      const vorname1: string = await generateVorname();
      const nachname1: string = await generateNachname();
      const klassenname: string = 'Playwright3a';

      const rolle2: string = 'Lehrkraft';
      const vorname2: string = await generateVorname();
      const nachname2: string = await generateNachname();
      const kopersnr2: string = await generateKopersNr();

      const rolle3: string = 'Lehrkraft';
      const vorname3: string = await generateVorname();
      const nachname3: string = await generateNachname();
      const kopersnr3: string = await generateKopersNr();

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
    'Einen Benutzer über das FE löschen',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const PersonDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const rolle: string = await generateRolleName();
      const berechtigung: string = 'SYSADMIN';
      const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

      await test.step(`Neuen Benutzer über die api anlegen`, async () => {
        await createRolleAndPersonWithUserContext(page, landSH, berechtigung, vorname, nachname, idSPs, rolle);
        rolleNames.push(rolle);
      });

      await test.step(`Benutzer wieder löschen über das FE`, async () => {
        await page.goto('/' + 'admin/personen');
        await personManagementView.inputSuchfeld.fill(nachname);
        await personManagementView.buttonSuchen.click();
        await page.getByRole('cell', { name: nachname, exact: true }).click();
        await PersonDetailsView.buttonDeletePerson.click();
        await PersonDetailsView.buttonDeletePersonConfirm.click();
        await PersonDetailsView.buttonCloseDeletePersonConfirm.click();
        await expect(personManagementView.textH2Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        // warten, dass die Seite mit dem Laden fertig ist, da z.B. icons mit ajax nachgeladen werden
        // dieses ist nur ein workaround; im FE muss noch eine Lösung für den Status 'Seite ist vollständig geladen' geschaffen werden
        await expect(header.iconMyProfil).toBeVisible();
        await expect(header.iconLogout).toBeVisible();
        await expect(personManagementView.comboboxMenuIconSchule).toBeVisible();
        await expect(personManagementView.comboboxMenuIconRolle).toBeVisible();
        await expect(personManagementView.comboboxMenuIconKlasse).toBeVisible();
        await expect(personManagementView.comboboxMenuIconStatus).toBeVisible();
        await expect(page.getByRole('cell', { name: nachname, exact: true })).toBeHidden();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    `Bei Nutzerneuanlage prüfen, dass die combobox 'Rolle' nach Auswahl einer Rolle, nur noch Rollen der gleichen Rollenart angeboten werden`,
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const rolleNames: string[] = [];

      await test.step(`Testdaten: Je 2 Rollen mit Rollenarten LEHR und LERN über die api anlegen`, async () => {
        const idLandSH: string = await getOrganisationId(page, landSH);

        for (let i: number = 0; i <= 4; i++) {
          rolleNames.push(await generateRolleName());
        }

        rolleIds.push(await createRolle(page, typeLehrer, idLandSH, rolleNames[0]));
        rolleIds.push(await createRolle(page, typeLehrer, idLandSH, rolleNames[1]));
        rolleIds.push(await createRolle(page, typeSchueler, idLandSH, rolleNames[2]));
        rolleIds.push(await createRolle(page, typeSchueler, idLandSH, rolleNames[3]));
      });

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog "Person anlegen" öffnen`, async () => {
        const startseite: StartPage = new StartPage(page);
        const menue: MenuPage = await startseite.goToAdministration();
        return await menue.personAnlegen();
      });

      await test.step(`In der Combobox 'Organisation' eine Schule auswählen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
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

  test(`Neuen Benutzer mit mehreren Rollen anlegen`, { tag: [LONG, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const rolleNames: string[] = [];
    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();

    await test.step(`Testdaten: 3 Rollen mit Rollenarten LEHR über die api anlegen`, async () => {
      const idLandSH: string = await getOrganisationId(page, landSH);

      for (let i: number = 0; i <= 2; i++) {
        rolleNames.push(await generateRolleName());
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
