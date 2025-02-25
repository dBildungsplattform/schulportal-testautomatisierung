import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { addSystemrechtToRolle } from '../base/api/testHelperRolle.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { landSH, testschule, testschule665Name, oeffentlichLandSH, ersatzLandSH } from '../base/organisation.ts';
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
import { TestHelperLdap } from '../base/testHelperLdap';
import FromAnywhere from '../pages/FromAnywhere';

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

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.checkHeadlineIsVisible());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.checkHeadlineIsVisible();
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
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
      const menue = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
      const header: HeaderPage = new HeaderPage(page);

      const rolle: string = 'Lehrkraft';
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
      const schulstrukturknoten: string = testschule;
      let einstiegspasswort: string = '';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer mit Kopers Nummer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.Input_Kopersnr.fill(kopersnr);
        await personCreationView.button_PersonAnlegen.click();
        await expect(personCreationView.text_success).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable benutzername
        usernames.push(await personCreationView.data_Benutzername.innerText());
        einstiegspasswort = await personCreationView.input_EinstiegsPasswort.inputValue();
      });

      await test.step(`In der Ergebnisliste prüfen dass der neue Benutzer ${nachname} angezeigt wird`, async () => {
        // Der Klick auf die Ergebnisliste funktioniert nicht zuverlaessig, darum der direkte Sprung in die Ergebnisliste via URL
        await page.goto('/' + 'admin/personen');
        await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.input_Suchfeld.fill(nachname);
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: nachname, exact: true })).toBeVisible();
      });

      await test.step(`Der neue Benutzer meldet sich mit dem temporären Passwort am Portal an und vergibt ein neues Passwort`, async () => {
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(usernames[0], einstiegspasswort);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
        await startseite.checkHeadlineIsVisible();
      });
    }
  );

  test(
    'Einen Benutzer mit der Rolle Landesadmin anlegen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const schulstrukturknoten: string = 'Öffentliche Schulen Land Schleswig-Holstein';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, true);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(landesadminRolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.text_success).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.data_Rolle).toHaveText(landesadminRolle);
      });
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
      const schulstrukturknoten: string = testschule;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.Input_Kopersnr.fill(kopersnr);
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.text_success).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable usernames
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.data_Rolle).toHaveText('LiV');
      });
    }
  );

  test(
    'Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden und einen weiteren Benutzer anlegen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const login = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const landing = new LandingPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const schulstrukturknoten: string = testschule;
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

        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePW();
        await startseite.checkHeadlineIsVisible();
        currentUserIsLandesadministrator = false;
      });

      // Step 2: Create another user as Schuladmin
      await test.step(`Schuladmin anlegen und mit diesem anmelden`, async () => {
        const newVorname: string = await generateVorname();
        const newNachname: string = await generateNachname();
        const newKopersnr: string = await generateKopersNr();

        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');

        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(newVorname);
        await personCreationView.Input_Nachname.fill(newNachname);
        await personCreationView.Input_Kopersnr.fill(newKopersnr);
        await personCreationView.button_PersonAnlegen.click();
        await expect(personCreationView.text_success).toBeVisible();

        // Save the username for cleanup
        usernames.push(await personCreationView.data_Benutzername.innerText());
      });
    }
  );

  test(
    'Einen Benutzer mit der Rolle Schueler anlegen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const schulstrukturknoten: string = testschule;
      const klasse: string = 'Playwright3a';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(schuelerRolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.combobox_Klasse.click();
        await page.getByText(klasse, { exact: true }).click();
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Prüfen dass der Benutzer mit der rolle Landesadmin angelegt wurde`, async () => {
        await expect(personCreationView.text_success).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.data_Rolle).toHaveText(schuelerRolle);
      });
    }
  );

  test(
    'Ergebnisliste Benutzer auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue = new MenuPage(page);
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      await test.step(`Benutzerverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_AlleBenutzerAnzeigen.click();
        await personManagementView.waitForData();
        await expect(personManagementView.text_h1_Administrationsbereich).toBeVisible();
        await expect(personManagementView.text_h2_Benutzerverwaltung).toBeVisible();
        await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await expect(personManagementView.input_Suchfeld).toBeVisible();
        await expect(personManagementView.button_Suchen).toBeVisible();
        await expect(personManagementView.table_header_Nachname).toBeVisible();
        await expect(personManagementView.table_header_Vorname).toBeVisible();
        await expect(personManagementView.table_header_Benutzername).toBeVisible();
        await expect(personManagementView.table_header_KopersNr).toBeVisible();
        await expect(personManagementView.table_header_Rolle).toBeVisible();
        await expect(personManagementView.table_header_Zuordnungen).toBeVisible();
        await expect(personManagementView.table_header_Klasse).toBeVisible();
      });
    }
  );

  test(
    "Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin",
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue = new MenuPage(page);
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);

      const Organisation_Land = landSH;
      const Organisation_OeffentlicheSchule = oeffentlichLandSH;
      const Organisation_Ersatzschule = ersatzLandSH;
      const Organisation_Schule = testschule;

      const rolleLehr = 'Lehrkraft';
      const rolleLiV = 'LiV';

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_BenutzerAnlegen.click();
        await expect(personCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
      });

      await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(Organisation_Land, true);
        await personCreationView.combobox_Rolle.click();
        await expect(personCreationView.listbox_Rolle).toContainText(landesadminRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.text_h2_PersonAnlegen.click();
      });

      await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.combobox_Schulstrukturknoten_Clear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(Organisation_OeffentlicheSchule, true);
        await personCreationView.combobox_Rolle.click();
        await expect(personCreationView.listbox_Rolle).toContainText(landesadminRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.text_h2_PersonAnlegen.click();
      });

      await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.combobox_Schulstrukturknoten_Clear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(Organisation_Ersatzschule, true);
        await personCreationView.combobox_Rolle.click();
        await expect(personCreationView.listbox_Rolle).toContainText(landesadminRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLehr);
        await expect(personCreationView.listbox_Rolle).not.toContainText(rolleLiV);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuladminOeffentlichRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(schuelerRolle);
        // close opened combobox organisation
        await personCreationView.text_h2_PersonAnlegen.click();
      });

      await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.combobox_Schulstrukturknoten_Clear.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(Organisation_Schule, false);
        await personCreationView.combobox_Rolle.click();
        await expect(personCreationView.listbox_Rolle).toContainText(rolleLehr);
        await expect(personCreationView.listbox_Rolle).toContainText(rolleLiV);
        await expect(personCreationView.listbox_Rolle).toContainText(schuelerRolle);
        await expect(personCreationView.listbox_Rolle).not.toContainText(landesadminRolle);
        await page.keyboard.type(schuladminOeffentlichRolle);
        await expect(personCreationView.listbox_Rolle).toContainText(schuladminOeffentlichRolle);
        // close opened combobox organisation
        await personCreationView.text_h2_PersonAnlegen.click();
      });
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
      const schulstrukturknoten: string = testschule;

      await test.step(`Benutzer Lehrkraft anlegen`, async () => {
        await page.goto('/' + 'admin/personen/new');
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.Input_Kopersnr.fill(kopersnr);
        await personCreationView.button_PersonAnlegen.click();
        await expect(personCreationView.text_success).toBeVisible();
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable benutzername
        usernames.push(await personCreationView.data_Benutzername.innerText());
      });

      await test.step(`Benutzerverwaltung öffnen und Suche nach Vornamen `, async () => {
        await page.goto('/' + 'admin/personen');
        await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.input_Suchfeld.fill(vorname);
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: vorname })).toBeVisible();
      });

      await test.step(`Suche nach Nachnamen `, async () => {
        await personManagementView.input_Suchfeld.fill(nachname);
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: nachname })).toBeVisible();
      });

      await test.step(`Suche nach Benutzernamen `, async () => {
        await personManagementView.input_Suchfeld.fill(usernames[0]);
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: nachname })).toBeVisible();
      });

      await test.step(`Suche nach Dienststellennummer `, async () => {
        await personManagementView.input_Suchfeld.fill('0056357');
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: 'ssuperadmin', exact: true })).toBeVisible();
      });

      await test.step(`Suche mit leerer Ergebnisliste. Gepüft wird, dass der Text "Keine Daten gefunden." gefunden wird, danach wird geprüft, dass die Tabelle 0 Zeilen hat.`, async () => {
        await personManagementView.input_Suchfeld.fill('!§$%aavvccdd44xx@');
        await personManagementView.button_Suchen.click();
        await expect(page.getByRole('cell', { name: 'Keine Daten gefunden.' })).toBeVisible();
        await expect(page.locator('v-data-table__td')).toHaveCount(0);
      });
    }
  );

  test(
    'In der Ergebnisliste die Filterfunktion der Schulen benutzen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      await test.step(`Filter öffnen und Schule selektieren`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
        await personManagementView.waitForData();

        // Fill the input with the name of the Schule and let the autocomplete find it
        await personManagementView.comboboxMenuIcon_Schule_input.fill(testschule665Name);

        // Click on the found Schule
        await page.getByRole('option', { name: testschule665Name }).click();

        // Close the dropdown
        await personManagementView.comboboxMenuIcon_Schule.click();

        // Click elsewhere on the page to fully confirm the selected Schule
        await personManagementView.button_Suchen.click();

        await expect(page.getByTestId('schule-select')).toHaveText('1111165 (Testschule-PW665)');

        await expect(personManagementView.getRows().first()).toContainText('1111165');
      });
    }
  );

  test(
    'Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite vollständig prüfen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const personCreationView: PersonCreationViewPage = new PersonCreationViewPage(page);
      const rolle: string = 'Lehrkraft';
      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const kopersnr: string = await generateKopersNr();
      const schulstrukturknoten: string = testschule;
      const dienststellenNr = '1111111';
      const testHelperLdap: TestHelperLdap = new TestHelperLdap(LDAP_URL, LDAP_ADMIN_PASSWORD);
      let createdBenutzername: string;

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
      });

      await test.step(`Benutzer anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname);
        await personCreationView.Input_Nachname.fill(nachname);
        await personCreationView.Input_Kopersnr.fill(kopersnr);
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await expect(personCreationView.text_h2_PersonAnlegen).toBeVisible();
        await expect(personCreationView.button_Schliessen).toBeVisible();
        await expect(personCreationView.text_success).toHaveText(
          vorname + ' ' + nachname + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        createdBenutzername = await personCreationView.data_Benutzername.innerText();
        await expect(personCreationView.text_DatenGespeichert).toBeVisible();
        await expect(personCreationView.label_Vorname).toHaveText('Vorname:');
        await expect(personCreationView.data_Vorname).toHaveText(vorname);
        await expect(personCreationView.label_Nachname).toHaveText('Nachname:');
        await expect(personCreationView.data_Nachname).toHaveText(nachname);
        await expect(personCreationView.label_Benutzername).toHaveText('Benutzername:');
        await expect(personCreationView.data_Benutzername).toContainText('tautopw');
        await expect(personCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.input_EinstiegsPasswort).toBeVisible();
        await expect(personCreationView.label_Rolle).toHaveText('Rolle:');
        await expect(personCreationView.data_Rolle).toHaveText(rolle);
        await expect(personCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.data_Organisationsebene).toHaveText(
          dienststellenNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP angelegt wurde`, async () => {
        expect(await testHelperLdap.validateUserExists(createdBenutzername)).toBeTruthy();
      });

      await test.step(`Prüfen, dass Lehrkraft im LDAP korrekter Gruppe zugeordnet wurde`, async () => {
        expect(await testHelperLdap.validateUserIsInGroupOfNames(createdBenutzername, dienststellenNr)).toBeTruthy();
      });
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

        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePW();
        currentUserIsLandesadministrator = false;
        await startseite.checkHeadlineIsVisible();
      });

      // Testdaten
      const schulstrukturknoten: string = testschule;
      const dienststellenNr = '1111111';
      const vorname1 = await generateVorname();
      const nachname1 = await generateNachname();
      const klassenname = 'Playwright3a';

      const rolle2 = 'Lehrkraft';
      const vorname2 = await generateVorname();
      const nachname2 = await generateNachname();
      const kopersnr2 = await generateKopersNr();

      const rolle3 = 'Lehrkraft';
      const vorname3 = await generateVorname();
      const nachname3 = await generateNachname();
      const kopersnr3 = await generateKopersNr();

      await test.step(`Dialog Person anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/personen/new');
      });

      await test.step(`Benutzer Schüler anlegen`, async () => {
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(schuelerRolle, { exact: true }).click();
        await personCreationView.combobox_Klasse.click();
        await page.getByText(klassenname).click();
        await personCreationView.Input_Vorname.fill(vorname1);
        await personCreationView.Input_Nachname.fill(nachname1);
        await personCreationView.Input_Vorname.click();
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Schüler prüfen`, async () => {
        await expect(personCreationView.text_h2_PersonAnlegen).toBeVisible();
        await expect(personCreationView.button_Schliessen).toBeVisible();
        await expect(personCreationView.text_success).toHaveText(
          vorname1 + ' ' + nachname1 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.text_DatenGespeichert).toBeVisible();
        await expect(personCreationView.label_Vorname).toHaveText('Vorname:');
        await expect(personCreationView.data_Vorname).toHaveText(vorname1);
        await expect(personCreationView.label_Nachname).toHaveText('Nachname:');
        await expect(personCreationView.data_Nachname).toHaveText(nachname1);
        await expect(personCreationView.label_Benutzername).toHaveText('Benutzername:');
        await expect(personCreationView.data_Benutzername).toContainText('tautopw');
        await expect(personCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.input_EinstiegsPasswort).toBeVisible();
        await expect(personCreationView.label_Rolle).toHaveText('Rolle:');
        await expect(personCreationView.data_Rolle).toHaveText(schuelerRolle);
        await expect(personCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.data_Organisationsebene).toHaveText(
          dienststellenNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.label_Klasse).toHaveText('Klasse:');
        await expect(personCreationView.data_Klasse).toHaveText(klassenname);
        await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
      });

      await test.step(`Weiteren Benutzer Lehrer1 anlegen`, async () => {
        await personCreationView.button_WeiterenBenutzerAnlegen.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle2, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname2);
        await personCreationView.Input_Nachname.fill(nachname2);
        await personCreationView.Input_Kopersnr.fill(kopersnr2);
        await personCreationView.Input_Vorname.click();
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Lehrer1 prüfen`, async () => {
        await expect(personCreationView.text_h2_PersonAnlegen).toBeVisible();
        await expect(personCreationView.button_Schliessen).toBeVisible();
        await expect(personCreationView.text_success).toHaveText(
          vorname2 + ' ' + nachname2 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.text_DatenGespeichert).toBeVisible();
        await expect(personCreationView.label_Vorname).toHaveText('Vorname:');
        await expect(personCreationView.data_Vorname).toHaveText(vorname2);
        await expect(personCreationView.label_Nachname).toHaveText('Nachname:');
        await expect(personCreationView.data_Nachname).toHaveText(nachname2);
        await expect(personCreationView.label_Benutzername).toHaveText('Benutzername:');
        await expect(personCreationView.data_Benutzername).toContainText('tautopw');
        await expect(personCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.input_EinstiegsPasswort).toBeVisible();
        await expect(personCreationView.label_Rolle).toHaveText('Rolle:');
        await expect(personCreationView.data_Rolle).toHaveText(rolle2);
        await expect(personCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.data_Organisationsebene).toHaveText(
          dienststellenNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
      });

      await test.step(`Weiteren Benutzer Lehrer2 anlegen`, async () => {
        await personCreationView.button_WeiterenBenutzerAnlegen.click();
        await personCreationView.comboboxOrganisationInput.searchByTitle(schulstrukturknoten, false);
        await personCreationView.combobox_Rolle.click();
        await page.getByText(rolle3, { exact: true }).click();
        await personCreationView.Input_Vorname.fill(vorname3);
        await personCreationView.Input_Nachname.fill(nachname3);
        await personCreationView.Input_Kopersnr.fill(kopersnr3);
        await personCreationView.Input_Vorname.click();
        await personCreationView.button_PersonAnlegen.click();
      });

      await test.step(`Bestätigungsseite Lehrer2 prüfen`, async () => {
        await expect(personCreationView.text_h2_PersonAnlegen).toBeVisible();
        await expect(personCreationView.button_Schliessen).toBeVisible();
        await expect(personCreationView.text_success).toHaveText(
          vorname3 + ' ' + nachname3 + ' wurde erfolgreich hinzugefügt.'
        );
        // Benutzer wird im afterEach-Block gelöscht
        // gesteuert wird die Löschung über die Variable username
        usernames.push(await personCreationView.data_Benutzername.innerText());
        await expect(personCreationView.text_DatenGespeichert).toBeVisible();
        await expect(personCreationView.label_Vorname).toHaveText('Vorname:');
        await expect(personCreationView.data_Vorname).toHaveText(vorname3);
        await expect(personCreationView.label_Nachname).toHaveText('Nachname:');
        await expect(personCreationView.data_Nachname).toHaveText(nachname3);
        await expect(personCreationView.label_Benutzername).toHaveText('Benutzername:');
        await expect(personCreationView.data_Benutzername).toContainText('tautopw');
        await expect(personCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
        await expect(personCreationView.input_EinstiegsPasswort).toBeVisible();
        await expect(personCreationView.label_Rolle).toHaveText('Rolle:');
        await expect(personCreationView.data_Rolle).toHaveText(rolle3);
        await expect(personCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
        await expect(personCreationView.data_Organisationsebene).toHaveText(
          dienststellenNr + ' (' + schulstrukturknoten + ')'
        );
        await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
        await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
      });
    }
  );

  test('Einen Benutzer über das FE löschen', { tag: [LONG, SHORT, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);
    const PersonDetailsView: PersonDetailsViewPage = new PersonDetailsViewPage(page);
    const header: HeaderPage = new HeaderPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const rolle = await generateRolleName();
    const berechtigung = 'SYSADMIN';
    const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

    await test.step(`Neuen Benutzer über die api anlegen`, async () => {
      await createRolleAndPersonWithUserContext(page, landSH, berechtigung, vorname, nachname, idSPs, rolle);
      rolleNames.push(rolle);
    });

    await test.step(`Benutzer wieder löschen über das FE`, async () => {
      await page.goto('/' + 'admin/personen');
      await personManagementView.input_Suchfeld.fill(nachname);
      await personManagementView.button_Suchen.click();
      await page.getByRole('cell', { name: nachname, exact: true }).click();
      await PersonDetailsView.button_deletePerson.click();
      await PersonDetailsView.button_deletePersonConfirm.click();
      await PersonDetailsView.button_closeDeletePersonConfirm.click();
      await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
      // warten, dass die Seite mit dem Laden fertig ist, da z.B. icons mit ajax nachgeladen werden
      // dieses ist nur ein workaround; im FE muss noch eine Lösung für den Status 'Seite ist vollständig geladen' geschaffen werden
      await expect(header.icon_myProfil).toBeVisible();
      await expect(header.icon_logout).toBeVisible();
      await expect(personManagementView.comboboxMenuIcon_Schule).toBeVisible();
      await expect(personManagementView.comboboxMenuIcon_Rolle).toBeVisible();
      await expect(personManagementView.comboboxMenuIcon_Klasse).toBeVisible();
      await expect(personManagementView.comboboxMenuIcon_Status).toBeVisible();
      await expect(page.getByRole('cell', { name: nachname, exact: true })).toBeHidden();
    });
  });
});
