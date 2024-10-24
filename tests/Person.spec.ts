import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { PersonCreationViewPage } from "../pages/admin/PersonCreationView.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page";
import { HeaderPage } from "../pages/Header.page";
import { faker } from "@faker-js/faker/locale/de";
import { createPersonWithUserContext } from "../base/api/testHelperPerson.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { UserInfo } from "../base/api/testHelper.page";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page";
import { LONG, SHORT, STAGE } from "../base/tags";
import { deletePersonByUsername, deleteRoleById, deleteRoleByName } from "../base/testHelperDeleteTestdata.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

let username: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht
let roleId: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht
let roleName: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const landing = new LandingPage(page);
      const startseite = new StartPage(page);
      const login = new LoginPage(page);
      await page.goto(FRONTEND_URL);
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    const header = new HeaderPage(page);
    const landing = new LandingPage(page);
    const login = new LoginPage(page);
    const startseite = new StartPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deletePersonByUsername(username, page);
        username = [];
      }

      if (roleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deleteRoleById(roleId, page);
        roleId = [];
      }

      if (roleName) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deleteRoleByName(roleName, page);
        roleName = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Einen Benutzer mit der Rolle Lehrkraft anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden", {tag: [LONG, SHORT, STAGE]}, async ({
    page,
  }) => {
    const landing = new LandingPage(page);
    const startseite = new StartPage(page);
    const login = new LoginPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);
    const personManagementView = new PersonManagementViewPage(page);
    const header = new HeaderPage(page);

    const rolle = "Lehrkraft";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const kopersnr = faker.string.numeric(7);
    const schulstrukturknoten = "Testschule Schulportal";
    let einstiegspasswort = "";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer mit Kopers Nummer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await personCreationView.Input_Vorname.fill(vorname);
      await personCreationView.Input_Nachname.fill(nachname);
      await personCreationView.Input_Kopersnr.fill(kopersnr);
      await personCreationView.button_PersonAnlegen.click();
      await expect(personCreationView.text_success).toBeVisible();
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable benutzername
      username.push(await personCreationView.data_Benutzername.innerText()); 
      einstiegspasswort = await personCreationView.input_EinstiegsPasswort.inputValue();
    });

    await test.step(`In der Ergebnisliste prüfen dass der neue Benutzer ${nachname} angezeigt wird`, async () => {
      // Der Klick auf die Ergebnisliste funktioniert nicht zuverlaessig, darum der direkte Sprung in die Ergebnisliste via URL
      await page.goto(FRONTEND_URL + "admin/personen");
      await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
      await personManagementView.input_Suchfeld.fill(nachname);
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: nachname, exact: true })).toBeVisible();
    });

    await test.step(`Der neue Benutzer meldet sich mit dem temporären Passwort am Portal an und vergibt ein neues Passwort`, async () => {
      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(username[0], einstiegspasswort);
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Einen Benutzer mit der Rolle Landesadmin anlegen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const rolle = "Landesadmin";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const schulstrukturknoten = "Öffentliche Schulen Land Schleswig-Holstein";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(schulstrukturknoten);
      await page.getByText(schulstrukturknoten, { exact: true }).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await personCreationView.Input_Vorname.fill(vorname);
      await personCreationView.Input_Nachname.fill(nachname);
      await personCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(personCreationView.text_success).toBeVisible();
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText());
      await expect(personCreationView.data_Rolle).toHaveText("Landesadmin");
    });
  });

  test("Einen Benutzer mit der Rolle LiV anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const rolle = "LiV";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const kopersnr = faker.string.numeric(7);
    const schulstrukturknoten = "Testschule Schulportal";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
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
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText()); 
      await expect(personCreationView.data_Rolle).toHaveText("LiV");
    });
  });

  test("Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const rolle = "Schuladmin";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const schulstrukturknoten = "(Testschule Schulportal)";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await personCreationView.Input_Vorname.fill(vorname);
      await personCreationView.Input_Nachname.fill(nachname);
      await personCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(personCreationView.text_success).toBeVisible();
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText()); 
      await expect(personCreationView.data_Rolle).toHaveText("Schuladmin");
    });
  });

  test("Einen Benutzer mit der Rolle SuS anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const rolle = "SuS";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const schulstrukturknoten = "(Carl-Orff-Schule)";
    const klasse = "9a";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle, { exact: true }).click();
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
      username.push(await personCreationView.data_Benutzername.innerText());
      await expect(personCreationView.data_Rolle).toHaveText("SuS");
    });
  });

  test("Ergebnisliste Benutzer auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personManagementView = new PersonManagementViewPage(page);

    await test.step(`Benutzerverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleBenutzerAnzeigen.click();
      await expect(personManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(personManagementView.text_h2_Benutzerverwaltung).toBeVisible();
      await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
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
  });

  test("Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin", {tag: [LONG, STAGE]}, async ({page}) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const Organisation_Land = "Land Schleswig-Holstein";
    const Organisation_OeffentlicheSchule = "Öffentliche Schulen Land Schleswig-Holstein";
    const Organisation_Ersatzschule = "Ersatzschulen Land Schleswig-Holstein";
    const Organisation_Schule = "1111111 (Testschule Schulportal)";

    const rolleLandesadmin = "Landesadmin";
    const rolleLehr = "Lehrkraft";
    const rolleLiV = "LiV";
    const rolleSchuladmin = "Schuladmin";
    const rolleSuS = "SuS";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_BenutzerAnlegen.click();
      await expect(personCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_Land);
      await page.getByText(Organisation_Land, { exact: true }).nth(1).click();

      await personCreationView.combobox_Rolle.click();
      await expect(personCreationView.body).toContainText(rolleLandesadmin);
      await expect(personCreationView.body).not.toContainText(rolleLehr);
      await expect(personCreationView.body).not.toContainText(rolleLiV);
      await expect(personCreationView.body).not.toContainText(rolleSchuladmin);
      await expect(personCreationView.body).not.toContainText(rolleSuS);
    });

    await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten_Clear.click();
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_OeffentlicheSchule);
      await page.getByText(Organisation_OeffentlicheSchule, { exact: true }).click();
      await personCreationView.combobox_Rolle.click();
      await expect(personCreationView.body).toContainText(rolleLandesadmin);
      await expect(personCreationView.body).not.toContainText(rolleLehr);
      await expect(personCreationView.body).not.toContainText(rolleLiV);
      await expect(personCreationView.body).not.toContainText(rolleSchuladmin);
      await expect(personCreationView.body).not.toContainText(rolleSuS);
    });

    await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten_Clear.click();
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_Ersatzschule);
      await page.getByText(Organisation_Ersatzschule, { exact: true }).click();
      await personCreationView.combobox_Rolle.click();
      await expect(personCreationView.body).toContainText(rolleLandesadmin);
      await expect(personCreationView.body).not.toContainText(rolleLehr);
      await expect(personCreationView.body).not.toContainText(rolleLiV);
      await expect(personCreationView.body).not.toContainText(rolleSchuladmin);
      await expect(personCreationView.body).not.toContainText(rolleSuS);
    });

    await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten_Clear.click();
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Organisation_Schule).click();
      await personCreationView.combobox_Rolle.click();
      await expect(personCreationView.body).toContainText(rolleLehr);
      await expect(personCreationView.body).toContainText(rolleLiV);
      await expect(personCreationView.body).toContainText(rolleSchuladmin);
      await expect(personCreationView.body).toContainText(rolleSuS);
      await expect(personCreationView.body).not.toContainText(rolleLandesadmin);
    });
  });

  test("In der Ergebnisliste die Suchfunktion ausführen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const personManagementView = new PersonManagementViewPage(page);
    const personCreationView = new PersonCreationViewPage(page);

    const rolle = "Lehrkraft";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const kopersnr = faker.string.numeric(7);
    const schulstrukturknoten = "Testschule Schulportal";

    await test.step(`Benutzer Lehrkraft anlegen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen/new");
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await personCreationView.Input_Vorname.fill(vorname);
      await personCreationView.Input_Nachname.fill(nachname);
      await personCreationView.Input_Kopersnr.fill(kopersnr);
      await personCreationView.button_PersonAnlegen.click();
      await expect(personCreationView.text_success).toBeVisible();
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable benutzername
      username.push(await personCreationView.data_Benutzername.innerText()); 
      
    });

    await test.step(`Benutzerverwaltung öffnen und Suche nach Vornamen `, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await expect(personManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
      await personManagementView.input_Suchfeld.fill(vorname);
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: vorname })).toBeVisible();
    });

    await test.step(`Suche nach Nachnamen `, async () => {
      await personManagementView.input_Suchfeld.fill(nachname);
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: nachname })).toBeVisible();
    });

    await test.step(`Suche nach Benutzernamen `, async () => {
      await personManagementView.input_Suchfeld.fill(username[0]);
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: nachname })).toBeVisible();
    });

    await test.step(`Suche nach Dienststellennummer `, async () => {
      await personManagementView.input_Suchfeld.fill("0056357");
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: "ssuperadmin" })).toBeVisible();
    });

    await test.step(`Suche mit leerer Ergebnisliste. Gepüft wird das der Text "Keine Daten gefunden." gefunden wird, danach wird gepüft dass die Tabelle 0 Zeilen hat.`, async () => {
      await personManagementView.input_Suchfeld.fill("!§$%aavvccdd44xx@");
      await personManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: "Keine Daten gefunden." })).toBeVisible();
      await expect(page.locator("v-data-table__td")).toHaveCount(0);
    });
  });

  test("Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite vollständig prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const personCreationView = new PersonCreationViewPage(page);
    const rolle = "Lehrkraft";
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const kopersnr = faker.string.numeric(7);
    const schulstrukturknoten = "Testschule Schulportal";
    const dienststellenNr = "1111111";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/personen/new');
    });

    await test.step(`Benutzer anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
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
      await expect(personCreationView.text_success).toHaveText(vorname + ' ' + nachname + ' wurde erfolgreich hinzugefügt.');
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText());
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
      await expect(personCreationView.data_Organisationsebene).toHaveText(dienststellenNr + ' (' + schulstrukturknoten + ')');
      await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });

  test("Mehere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten SuS und LEHR und die Bestätigungsseiten vollständig prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const landing = new LandingPage(page);
    const startseite = new StartPage(page);
    const login = new LoginPage(page);
    const header = new HeaderPage(page);
    const personCreationView = new PersonCreationViewPage(page);
    let userInfo: UserInfo;

    await test.step(`Testdaten: Landesadmin anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      userInfo = await createPersonWithUserContext(page, 'Land Schleswig-Holstein', 'SYSADMIN', 'TAuto-PW-B-Master', 'TAuto-PW-B-Hans', idSP, 'TAuto-PW-R-RolleSYSADMIN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'ROLLEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'KLASSEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULTRAEGER_VERWALTEN');
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(userInfo.username);
      roleId.push(userInfo.rolleId);

      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(userInfo.username, userInfo.password);
      userInfo.password = await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });

    // Testdaten
    const schulstrukturknoten = "Testschule Schulportal";
    const dienststellenNr = "1111111";
    const rolle1 = "SuS";
    const vorname1 = "TAuto-PW-VA-" + faker.person.firstName();
    const nachname1 = "TAuto-PW-NA-" + faker.person.lastName();
    const klassenname = "Playwright3a";

    const rolle2 = "Lehrkraft";
    const vorname2 = "TAuto-PW-VB-" + faker.person.firstName();
    const nachname2 = "TAuto-PW-NB-" + faker.person.lastName();
    const kopersnr2 = faker.string.numeric(7);

    const rolle3 = "Lehrkraft";
    const vorname3 = "TAuto-PW-VC-" + faker.person.firstName();
    const nachname3 = "TAuto-PW-NC-" + faker.person.lastName();
    const kopersnr3 = faker.string.numeric(7);

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/personen/new');
    });

    await test.step(`Benutzer Schüler anlegen`, async () => {
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
      await personCreationView.combobox_Rolle.click();
      await page.getByText(rolle1, { exact: true }).click();
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
      await expect(personCreationView.text_success).toHaveText(vorname1 + ' ' + nachname1 + ' wurde erfolgreich hinzugefügt.');
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText());
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
      await expect(personCreationView.data_Rolle).toHaveText(rolle1);
      await expect(personCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
      await expect(personCreationView.data_Organisationsebene).toHaveText(dienststellenNr + ' (' + schulstrukturknoten + ')');
      await expect(personCreationView.label_Klasse).toHaveText('Klasse:');
      await expect(personCreationView.data_Klasse).toHaveText(klassenname);
      await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });

    await test.step(`Weiteren Benutzer Lehrer1 anlegen`, async () => {
      await personCreationView.button_WeiterenBenutzerAnlegen.click();
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
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
      await expect(personCreationView.text_success).toHaveText(vorname2 + ' ' + nachname2 + ' wurde erfolgreich hinzugefügt.');
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText());
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
      await expect(personCreationView.data_Organisationsebene).toHaveText(dienststellenNr + ' (' + schulstrukturknoten + ')');
      await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });

    await test.step(`Weiteren Benutzer Lehrer2 anlegen`, async () => {
      await personCreationView.button_WeiterenBenutzerAnlegen.click();
      await personCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulstrukturknoten).click();
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
      await expect(personCreationView.text_success).toHaveText(vorname3 + ' ' + nachname3 + ' wurde erfolgreich hinzugefügt.');
      // Benutzer wird im afterEach-Block gelöscht
      // gesteuert wird die Löschung über die Variable username
      username.push(await personCreationView.data_Benutzername.innerText());
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
      await expect(personCreationView.data_Organisationsebene).toHaveText(dienststellenNr + ' (' + schulstrukturknoten + ')');
      await expect(personCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(personCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });

  test("Einen Benutzer über das FE löschen @long @short @stage", async ({page, }) => {
    const personManagementView = new PersonManagementViewPage(page);
    const PersonDetailsView = new PersonDetailsViewPage(page);

    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const rolle = "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const berechtigung = 'SYSADMIN';
    const idSP = await getSPId(page, 'Schulportal-Administration');
    const header = new HeaderPage(page);

    await test.step(`Neuen Benutzer über die api anlegen`, async () => {
      await createPersonWithUserContext(page, 'Land Schleswig-Holstein', berechtigung, vorname, nachname, idSP, rolle);
      roleName.push(rolle);
    })

    await test.step(`Benutzer wieder löschen über das FE`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await personManagementView.input_Suchfeld.fill(nachname);
      await personManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: nachname, exact: true }).click();
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
      await expect(page.getByRole("cell", { name: nachname, exact: true })).toBeHidden();
    });
  })
});