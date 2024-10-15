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
import { deletePersonen, getPersonId, createPersonWithUserContext } from "../base/api/testHelperPerson.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { UserInfo } from "../base/api/testHelper.page";
import { addSystemrechtToRolle, deleteRolle } from "../base/api/testHelperRolle.page";
import { LONG, SHORT, STAGE } from "../base/tags";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const Landing = new LandingPage(page);
      const Startseite = new StartPage(page);
      const Login = new LoginPage(page);
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test("Einen Benutzer mit der Rolle Lehrkraft anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden", {tag: [LONG, SHORT, STAGE]}, async ({
    page,
  }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);
    const Header = new HeaderPage(page);

    const Rolle = "Lehrkraft";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Kopersnr = faker.string.numeric(7);
    const Schulstrukturknoten = "Testschule Schulportal";
    let Benutzername = "";
    let Einstiegspasswort = "";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer mit Kopers Nummer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr);
      await PersonCreationView.button_PersonAnlegen.click();
      await expect(PersonCreationView.text_success).toBeVisible();

      Benutzername = await PersonCreationView.data_Benutzername.innerText();
      Einstiegspasswort = await PersonCreationView.input_EinstiegsPasswort.inputValue();
    });

    await test.step(`In der Ergebnisliste prüfen dass der neue Benutzer ${Nachname} angezeigt wird`, async () => {
      // Der Klick auf die Ergebnisliste funktioniert nicht zuverlaessig, darum der direkte Sprung in die Ergebnisliste via URL
      await page.goto(FRONTEND_URL + "admin/personen");
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: Nachname, exact: true })).toBeVisible();
    });

    await test.step(`Der neue Benutzer meldet sich mit dem temporären Passwort am Portal an und vergibt ein neues Passwort`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(Benutzername, Einstiegspasswort);
      await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();

      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page
        .getByTestId("close-person-delete-success-dialog-button")
        .click();
    });
  });

  test("Einen Benutzer mit der Rolle Landesadmin anlegen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "Landesadmin";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "Öffentliche Schulen Land Schleswig-Holstein";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Schulstrukturknoten);
      await page.getByText(Schulstrukturknoten, { exact: true }).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.data_Rolle).toHaveText("Landesadmin");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle LiV anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "LiV";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Kopersnr = faker.string.numeric(7);
    const Schulstrukturknoten = "Testschule Schulportal";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr);
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.data_Rolle).toHaveText("LiV");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "Schuladmin";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "(Testschule Schulportal)";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.data_Rolle).toHaveText("Schuladmin");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle SuS anlegen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "SuS";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "(Carl-Orff-Schule)";
    const Klasse = "9a";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.combobox_Klasse.click();
      await page.getByText(Klasse, { exact: true }).click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.data_Rolle).toHaveText("SuS");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Ergebnisliste Benutzer auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    await test.step(`Benutzerverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleBenutzerAnzeigen.click();
      await expect(PersonManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toBeVisible();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
      await expect(PersonManagementView.input_Suchfeld).toBeVisible();
      await expect(PersonManagementView.button_Suchen).toBeVisible();
      await expect(PersonManagementView.table_header_Nachname).toBeVisible();
      await expect(PersonManagementView.table_header_Vorname).toBeVisible();
      await expect(PersonManagementView.table_header_Benutzername).toBeVisible();
      await expect(PersonManagementView.table_header_KopersNr).toBeVisible();
      await expect(PersonManagementView.table_header_Rolle).toBeVisible();
      await expect(PersonManagementView.table_header_Zuordnungen).toBeVisible();
      await expect(PersonManagementView.table_header_Klasse).toBeVisible();
    });
  });

  test("Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({page}) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);

    const Organisation_Land = "Land Schleswig-Holstein";
    const Organisation_OeffentlicheSchule = "Öffentliche Schulen Land Schleswig-Holstein";
    const Organisation_Ersatzschule = "Ersatzschulen Land Schleswig-Holstein";
    const Organisation_Schule = "1111111 (Testschule Schulportal)";

    const Rolle_Landesadmin = "Landesadmin";
    const Rolle_Lehr = "Lehrkraft";
    const Rolle_LiV = "LiV";
    const Rolle_Schuladmin = "Schuladmin";
    const Rolle_SuS = "SuS";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_Land);
      await page.getByText(Organisation_Land, { exact: true }).nth(1).click();
      await PersonCreationView.combobox_Rolle.click();
      await expect(PersonCreationView.body).toContainText(Rolle_Landesadmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Lehr);
      await expect(PersonCreationView.body).not.toContainText(Rolle_LiV);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Schuladmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_SuS);
    });

    await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten_Clear.click();
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_OeffentlicheSchule);
      await page.getByText(Organisation_OeffentlicheSchule, { exact: true }).click();
      await PersonCreationView.combobox_Rolle.click();
      await expect(PersonCreationView.body).toContainText(Rolle_Landesadmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Lehr);
      await expect(PersonCreationView.body).not.toContainText(Rolle_LiV);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Schuladmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_SuS);
    });

    await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten_Clear.click();
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.keyboard.type(Organisation_Ersatzschule);
      await page.getByText(Organisation_Ersatzschule, { exact: true }).click();
      await PersonCreationView.combobox_Rolle.click();
      await expect(PersonCreationView.body).toContainText(Rolle_Landesadmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Lehr);
      await expect(PersonCreationView.body).not.toContainText(Rolle_LiV);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Schuladmin);
      await expect(PersonCreationView.body).not.toContainText(Rolle_SuS);
    });

    await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten_Clear.click();
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Organisation_Schule).click();
      await PersonCreationView.combobox_Rolle.click();
      await expect(PersonCreationView.body).toContainText(Rolle_Lehr);
      await expect(PersonCreationView.body).toContainText(Rolle_LiV);
      await expect(PersonCreationView.body).toContainText(Rolle_Schuladmin);
      await expect(PersonCreationView.body).toContainText(Rolle_SuS);
      await expect(PersonCreationView.body).not.toContainText(Rolle_Landesadmin);
    });
  });

  test("In der Ergebnisliste die Suchfunktion ausführen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const PersonManagementView = new PersonManagementViewPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);

    const Rolle = "Lehrkraft";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Kopersnr = faker.string.numeric(7);
    const Schulstrukturknoten = "Testschule Schulportal";
    let Benutzername = "";

    await test.step(`Benutzer Lehrkraft anlegen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen/new");
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr);
      await PersonCreationView.button_PersonAnlegen.click();
      Benutzername = await PersonCreationView.data_Benutzername.innerText();
      await expect(PersonCreationView.text_success).toBeVisible();
    });

    await test.step(`Benutzerverwaltung öffnen und Suche nach Vornamen `, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toHaveText("Benutzerverwaltung");
      await PersonManagementView.input_Suchfeld.fill(Vorname);
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: Vorname })).toBeVisible();
    });

    await test.step(`Suche nach Nachnamen `, async () => {
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: Nachname })).toBeVisible();
    });

    await test.step(`Suche nach Benutzernamen `, async () => {
      await PersonManagementView.input_Suchfeld.fill(Benutzername);
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: Nachname })).toBeVisible();
    });

    await test.step(`Suche nach Dienststellennummer `, async () => {
      await PersonManagementView.input_Suchfeld.fill("0056357");
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: "ssuperadmin" })).toBeVisible();
    });

    await test.step(`Suche mit leerer Ergebnisliste. Gepüft wird das der Text "Keine Daten gefunden." gefunden wird, danach wird gepüft dass die Tabelle 0 Zeilen hat.`, async () => {
      await PersonManagementView.input_Suchfeld.fill("!§$%aavvccdd44xx@");
      await PersonManagementView.button_Suchen.click();
      await expect(page.getByRole("cell", { name: "Keine Daten gefunden." })).toBeVisible();
      await expect(page.locator("v-data-table__td")).toHaveCount(0);
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-button").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite vollständig prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const PersonCreationView = new PersonCreationViewPage(page);
    const Rolle = "Lehrkraft";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Kopersnr = faker.string.numeric(7);
    const Schulstrukturknoten = "Testschule Schulportal";
    const Dienststellennummer = "1111111";
    let BenutzerID = '';
    let Benutzername = '';

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/personen/new');
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr);
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(PersonCreationView.text_h2_PersonAnlegen).toBeVisible();
      await expect(PersonCreationView.button_Schliessen).toBeVisible();
      await expect(PersonCreationView.text_success).toHaveText(Vorname + ' ' + Nachname + ' wurde erfolgreich hinzugefügt.');
      await expect(PersonCreationView.text_DatenGespeichert).toBeVisible();
      await expect(PersonCreationView.label_Vorname).toHaveText('Vorname:');
      await expect(PersonCreationView.data_Vorname).toHaveText(Vorname);
      await expect(PersonCreationView.label_Nachname).toHaveText('Nachname:');
      await expect(PersonCreationView.data_Nachname).toHaveText(Nachname);
      await expect(PersonCreationView.label_Benutzername).toHaveText('Benutzername:');
      await expect(PersonCreationView.data_Benutzername).toContainText('tautopw');
      await expect(PersonCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
      await expect(PersonCreationView.input_EinstiegsPasswort).toBeVisible();
      await expect(PersonCreationView.label_Rolle).toHaveText('Rolle:');
      await expect(PersonCreationView.data_Rolle).toHaveText(Rolle);
      await expect(PersonCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
      await expect(PersonCreationView.data_Organisationsebene).toHaveText(Dienststellennummer + ' (' + Schulstrukturknoten + ')');
      await expect(PersonCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(PersonCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      Benutzername = await PersonCreationView.data_Benutzername.innerText();
      BenutzerID = await getPersonId(page, Benutzername);
      await deletePersonen(page, BenutzerID);
    });
  });

  test("Mehere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten SuS und LEHR und die Bestätigungsseiten vollständig prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Header = new HeaderPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
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

      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(userInfo.username, userInfo.password);
      userInfo.password = await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });

    // Testdaten
    const Schulstrukturknoten = "Testschule Schulportal";
    const Dienststellennummer = "1111111";
    const Rolle1 = "SuS";
    const Vorname1 = "TAuto-PW-VA-" + faker.person.firstName();
    const Nachname1 = "TAuto-PW-NA-" + faker.person.lastName();
    const KLASSENNAME = "Playwright3a";
    let BenutzerID1 = '';
    let Benutzername1 = '';

    const Rolle2 = "Lehrkraft";
    const Vorname2 = "TAuto-PW-VB-" + faker.person.firstName();
    const Nachname2 = "TAuto-PW-NB-" + faker.person.lastName();
    const Kopersnr2 = faker.string.numeric(7);
    let BenutzerID2 = '';
    let Benutzername2 = '';

    const Rolle3 = "Lehrkraft";
    const Vorname3 = "TAuto-PW-VC-" + faker.person.firstName();
    const Nachname3 = "TAuto-PW-NC-" + faker.person.lastName();
    const Kopersnr3 = faker.string.numeric(7);
    let BenutzerID3 = '';
    let Benutzername3 = '';

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/personen/new');
    });

    await test.step(`Benutzer Schüler anlegen`, async () => {
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle1, { exact: true }).click();
      await PersonCreationView.combobox_Klasse.click();
      await page.getByText(KLASSENNAME).click();
      await PersonCreationView.Input_Vorname.fill(Vorname1);
      await PersonCreationView.Input_Nachname.fill(Nachname1);
      await PersonCreationView.Input_Vorname.click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Bestätigungsseite Schüler prüfen`, async () => {
      await expect(PersonCreationView.text_h2_PersonAnlegen).toBeVisible();
      await expect(PersonCreationView.button_Schliessen).toBeVisible();
      await expect(PersonCreationView.text_success).toHaveText(Vorname1 + ' ' + Nachname1 + ' wurde erfolgreich hinzugefügt.');
      await expect(PersonCreationView.text_DatenGespeichert).toBeVisible();
      await expect(PersonCreationView.label_Vorname).toHaveText('Vorname:');
      await expect(PersonCreationView.data_Vorname).toHaveText(Vorname1);
      await expect(PersonCreationView.label_Nachname).toHaveText('Nachname:');
      await expect(PersonCreationView.data_Nachname).toHaveText(Nachname1);
      await expect(PersonCreationView.label_Benutzername).toHaveText('Benutzername:');
      await expect(PersonCreationView.data_Benutzername).toContainText('tautopw');
      await expect(PersonCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
      await expect(PersonCreationView.input_EinstiegsPasswort).toBeVisible();
      await expect(PersonCreationView.label_Rolle).toHaveText('Rolle:');
      await expect(PersonCreationView.data_Rolle).toHaveText(Rolle1);
      await expect(PersonCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
      await expect(PersonCreationView.data_Organisationsebene).toHaveText(Dienststellennummer + ' (' + Schulstrukturknoten + ')');
      await expect(PersonCreationView.label_Klasse).toHaveText('Klasse:');
      await expect(PersonCreationView.data_Klasse).toHaveText(KLASSENNAME);
      await expect(PersonCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(PersonCreationView.button_ZurueckErgebnisliste).toBeVisible();
      Benutzername1 = await PersonCreationView.data_Benutzername.innerText();
      BenutzerID1 = await getPersonId(page, Benutzername1);
    });

    await test.step(`Weiteren Benutzer Lehrer1 anlegen`, async () => {
      await PersonCreationView.button_WeiterenBenutzerAnlegen.click();
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle2, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname2);
      await PersonCreationView.Input_Nachname.fill(Nachname2);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr2);
      await PersonCreationView.Input_Vorname.click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Bestätigungsseite Lehrer1 prüfen`, async () => {
      await expect(PersonCreationView.text_h2_PersonAnlegen).toBeVisible();
      await expect(PersonCreationView.button_Schliessen).toBeVisible();
      await expect(PersonCreationView.text_success).toHaveText(Vorname2 + ' ' + Nachname2 + ' wurde erfolgreich hinzugefügt.');
      await expect(PersonCreationView.text_DatenGespeichert).toBeVisible();
      await expect(PersonCreationView.label_Vorname).toHaveText('Vorname:');
      await expect(PersonCreationView.data_Vorname).toHaveText(Vorname2);
      await expect(PersonCreationView.label_Nachname).toHaveText('Nachname:');
      await expect(PersonCreationView.data_Nachname).toHaveText(Nachname2);
      await expect(PersonCreationView.label_Benutzername).toHaveText('Benutzername:');
      await expect(PersonCreationView.data_Benutzername).toContainText('tautopw');
      await expect(PersonCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
      await expect(PersonCreationView.input_EinstiegsPasswort).toBeVisible();
      await expect(PersonCreationView.label_Rolle).toHaveText('Rolle:');
      await expect(PersonCreationView.data_Rolle).toHaveText(Rolle2);
      await expect(PersonCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
      await expect(PersonCreationView.data_Organisationsebene).toHaveText(Dienststellennummer + ' (' + Schulstrukturknoten + ')');
      await expect(PersonCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(PersonCreationView.button_ZurueckErgebnisliste).toBeVisible();
      Benutzername2 = await PersonCreationView.data_Benutzername.innerText();
      BenutzerID2 = await getPersonId(page, Benutzername2);
    });

    await test.step(`Weiteren Benutzer Lehrer2 anlegen`, async () => {
      await PersonCreationView.button_WeiterenBenutzerAnlegen.click();
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle3, { exact: true }).click();
      await PersonCreationView.Input_Vorname.fill(Vorname3);
      await PersonCreationView.Input_Nachname.fill(Nachname3);
      await PersonCreationView.Input_Kopersnr.fill(Kopersnr3);
      await PersonCreationView.Input_Vorname.click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Bestätigungsseite Lehrer2 prüfen`, async () => {
      await expect(PersonCreationView.text_h2_PersonAnlegen).toBeVisible();
      await expect(PersonCreationView.button_Schliessen).toBeVisible();
      await expect(PersonCreationView.text_success).toHaveText(Vorname3 + ' ' + Nachname3 + ' wurde erfolgreich hinzugefügt.');
      await expect(PersonCreationView.text_DatenGespeichert).toBeVisible();
      await expect(PersonCreationView.label_Vorname).toHaveText('Vorname:');
      await expect(PersonCreationView.data_Vorname).toHaveText(Vorname3);
      await expect(PersonCreationView.label_Nachname).toHaveText('Nachname:');
      await expect(PersonCreationView.data_Nachname).toHaveText(Nachname3);
      await expect(PersonCreationView.label_Benutzername).toHaveText('Benutzername:');
      await expect(PersonCreationView.data_Benutzername).toContainText('tautopw');
      await expect(PersonCreationView.label_EinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
      await expect(PersonCreationView.input_EinstiegsPasswort).toBeVisible();
      await expect(PersonCreationView.label_Rolle).toHaveText('Rolle:');
      await expect(PersonCreationView.data_Rolle).toHaveText(Rolle3);
      await expect(PersonCreationView.label_Organisationsebene).toHaveText('Organisationsebene:');
      await expect(PersonCreationView.data_Organisationsebene).toHaveText(Dienststellennummer + ' (' + Schulstrukturknoten + ')');
      await expect(PersonCreationView.button_WeiterenBenutzerAnlegen).toBeVisible();
      await expect(PersonCreationView.button_ZurueckErgebnisliste).toBeVisible();
      Benutzername3 = await PersonCreationView.data_Benutzername.innerText();
      BenutzerID3 = await getPersonId(page, Benutzername3);
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await deletePersonen(page, BenutzerID1);
      await deletePersonen(page, BenutzerID2);
      await deletePersonen(page, BenutzerID3);
      await deletePersonen(page, userInfo.personId);
      await deleteRolle(page, userInfo.rolleId);
    });
  });

  test("Einen Benutzer über das FE löschen @long @short @stage", async ({page, }) => {
    const PersonManagementView = new PersonManagementViewPage(page);
    const PersonDetailsView = new PersonDetailsViewPage(page);

    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const rolle = "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const berechtigung = 'SYSADMIN';
    const idSP = await getSPId(page, 'Schulportal-Administration');

    await test.step(`Neuen Benutzer über die api anlegen`, async () => {
      await createPersonWithUserContext(page, 'Land Schleswig-Holstein', berechtigung, vorname, nachname, idSP, rolle);
    })

    await test.step(`Benutzer wieder löschen über das FE`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: nachname, exact: true }).click();
      await PersonDetailsView.button_deletePerson.click();
      await PersonDetailsView.button_deletePersonConfirm.click();
      await PersonDetailsView.button_closeDeletePersonConfirm.click();
      await expect(page.getByRole("cell", { name: nachname, exact: true })).toBeHidden();
    });
  })
});