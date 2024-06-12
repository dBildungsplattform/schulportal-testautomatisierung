import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { PersonCreationViewPage } from "../pages/admin/PersonCreationView.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { HeaderPage } from "../pages/Header.page";
import { faker } from "@faker-js/faker/locale/de";

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

  test("Einen Benutzer mit der Rolle Lehrkraft anlegen und anschließend mit diesem Benutzer anmelden", async ({
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
    const Schulstrukturknoten = "(Testschule Schulportal)";
    let Benutzername = "";
    let Einstiegspasswort = "";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();

      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);

      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();

      await PersonCreationView.button_PersonAnlegen.click();
      await expect(PersonCreationView.text_success).toBeVisible();

      Benutzername = await PersonCreationView.text_Bestaetigungsseite_Benutzername.innerText();
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
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle Landesadmin anlegen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "Landesadmin";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "Öffentliche Schulen Land Schleswig Holstein";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.text_Bestaetigungsseite_Rolle).toHaveText("Landesadmin");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle LiV anlegen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "LiV";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "(Testschule Schulportal)";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.text_Bestaetigungsseite_Rolle).toHaveText("LiV");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle Schuladmin anlegen", async ({ page }) => {
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
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.text_Bestaetigungsseite_Rolle).toHaveText("Schuladmin");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Einen Benutzer mit der Rolle SuS anlegen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    const Rolle = "SuS";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "(Carl-Orff-Schule)";
    const Klasse = "9a"

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();
      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);
      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();
      await PersonCreationView.combobox_Klasse.click();
      await page.getByText(Klasse).click();
      await PersonCreationView.button_PersonAnlegen.click();
    });

    await test.step(`Prüfen dass der Benutzer mit der Rolle Landesadmin angelegt wurde`, async () => {
      await expect(PersonCreationView.text_success).toBeVisible();
      await expect(PersonCreationView.text_Bestaetigungsseite_Rolle).toHaveText("SuS");
    });

    await test.step(`Benutzer wieder löschen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await PersonManagementView.input_Suchfeld.fill(Nachname);
      await PersonManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: Nachname, exact: true }).click();
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });

  test("Ergebnisliste Benutzer auf Vollständigkeit prüfen", async ({
    page,
  }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    await test.step(`Benutzerverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleBenutzerAnzeigen.click();
      await expect(PersonManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung ).toBeVisible();
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

  test("Prüfung auf ungültige Organisationen bei Anlage Benutzer", async ({
    page,
  }) => {
    // Bei Auswahl einer Rolle dürfen in dem Dropdown Administrationsebene nur Organisationen angezeigt werden, die für die Rolle auch gültig sind. Z.B dürfen für die Rolle Landesadmin nur die Organisationen mit Typ ROOT und LAND angezeigt werden.
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);

    const Rolle_LANDESADMIN = "Landesadmin";
    const Rolle_LEHR = "Lehrkraft";
    const Rolle_LIV = "LiV";
    const Rolle_SCHULADMIN = "Schuladmin";
    const Rolle_SUS = "SuS";

    const TYP_ORGA_ROOT = "ROOT";
    const TYP_ORGA_LAND = "LAND";
    const TYP_ORGA_SCHULE = "SCHULE";

    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText("Neuen Benutzer hinzufügen");
    });

    await test.step(`Rolle Landesadmin auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: ROOT, LAND)`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LANDESADMIN).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten")
      );
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;

      responseBody_schulstrukturknoten.moeglicheSsks.forEach((element) => {
        if (
          !(element.typ === TYP_ORGA_ROOT) &&
          !(element.typ === TYP_ORGA_LAND)
        ) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });
    });

    await test.step(`Rolle Lehrkraft auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LEHR).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten =
        await response_schulstrukturknoten.json();
      let gueltig = true;

      responseBody_schulstrukturknoten.moeglicheSsks.forEach((element) => {
        if (!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });
    });

    await test.step(`Rolle LiV auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LIV).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) =>  response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;

      responseBody_schulstrukturknoten.moeglicheSsks.forEach((element) => {
        if (!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });
    });

    await test.step(`Rolle Schuladmin auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_SCHULADMIN).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;

      responseBody_schulstrukturknoten.moeglicheSsks.forEach((element) => {
        if (!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });
    });

    await test.step(`Rolle SuS auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_SUS).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten =
        await response_schulstrukturknoten.json();
      let gueltig = true;

      responseBody_schulstrukturknoten.moeglicheSsks.forEach((element) => {
        if (!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });
    });
  });

  test("In der Ergebnisliste die Suchfunktion ausführen", async ({ page }) => {
    const PersonManagementView = new PersonManagementViewPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);

    const Rolle = "Lehrkraft";
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Schulstrukturknoten = "(Testschule Schulportal)";
    let Benutzername = "";

    await test.step(`Benutzer Lehrkraft anlegen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen/new");
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();

      await PersonCreationView.Input_Vorname.fill(Vorname);
      await PersonCreationView.Input_Nachname.fill(Nachname);

      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();

      await PersonCreationView.button_PersonAnlegen.click();
      Benutzername = await PersonCreationView.text_Bestaetigungsseite_Benutzername.innerText();
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
      await expect(page.getByRole("cell", { name: Nachname})).toBeVisible();
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
      await page.getByTestId("open-person-delete-dialog-icon").click();
      await page.getByTestId("person-delete-button").click();
      await page.getByTestId("close-person-delete-success-dialog-button").click();
    });
  });
});