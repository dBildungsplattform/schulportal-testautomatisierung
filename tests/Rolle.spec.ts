import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { RolleCreationViewPage } from "../pages/admin/RolleCreationView.page";
import { RolleManagementViewPage } from "../pages/admin/RolleManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { getRolleId, deleteRolle } from "../base/api/testHelperRolle.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Rollen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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
    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test("2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const RolleCreationView = new RolleCreationViewPage(page);
    const RolleManagementView = new RolleManagementViewPage(page);

    const ROLLENNAME1 = "TAuto-PW-R1-" + faker.lorem.word({ length: { min: 8, max: 12 } });
    const ROLLENNAME2 = "TAuto-PW-R2-" + faker.lorem.word({ length: { min: 8, max: 12 } });
    const SCHULSTRUKTURKNOTEN1 = "0701114 (Land Schleswig-Holstein)";
    const SCHULSTRUKTURKNOTEN2 = "0703754 (Amalie-Sieveking-Schule)";
    const ROLLENART1 = "Lern";
    const ROLLENART2 = "Lehr";
    const Merkmal2 = "KoPers-Nr. ist Pflichtangabe";
    const Angebot1 = "itslearning";
    const AngebotA2 = "E-Mail";
    const AngebotB2 = "Kalender"

    await test.step(`Dialog Rolle anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_RolleAnlegen.click();
      await expect(RolleCreationView.text_h2_RolleAnlegen).toHaveText("Neue Rolle hinzufügen");
    });

    await test.step(`Erste Rolle anlegen`, async () => {
      await RolleCreationView.combobox_Schulstrukturknoten.click();

      await page.getByText(SCHULSTRUKTURKNOTEN1, { exact: true }).click();
      await RolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART1, { exact: true }).click();
      await RolleCreationView.input_Rollenname.fill(ROLLENNAME1);
      await RolleCreationView.combobox_Angebote.click();
      await page.getByText(Angebot1, { exact: true }).click();
      await RolleCreationView.button_RolleAnlegen.click();
      await expect(RolleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Rolle anlegen`, async () => {
      await RolleCreationView.button_WeitereRolleAnlegen.click();

      await RolleCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(SCHULSTRUKTURKNOTEN2, { exact: true }).click();
      await RolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART2, { exact: true }).click();
      await RolleCreationView.input_Rollenname.fill(ROLLENNAME2);
      await RolleCreationView.combobox_Merkmal.click();
      await page.getByText(Merkmal2, { exact: true }).click();
      await RolleCreationView.combobox_Angebote.click();
      await page.getByText(AngebotA2, { exact: true }).click();
      await page.getByText(AngebotB2, { exact: true }).click();

      await RolleCreationView.button_RolleAnlegen.click();
      await expect(RolleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
      await Menue.menueItem_AlleRollenAnzeigen.click();
      await expect(RolleManagementView.text_h2_Rollenverwaltung).toHaveText("Rollenverwaltung");
      await expect(page.getByRole("cell", { name: ROLLENNAME1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: ROLLENNAME2 })).toBeVisible();
    });

    await test.step(`Rollen wieder löschen`, async () => {
      const RollenID1 = await getRolleId(page, ROLLENNAME1); 
      const RollenID2 = await getRolleId(page, ROLLENNAME2); 
      await deleteRolle(page, RollenID1);
      await deleteRolle(page, RollenID2);
    });
  });

  test("Ergebnisliste Rollen auf Vollständigkeit prüfen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const RolleManagementView = new RolleManagementViewPage(page);

    await test.step(`Rollenverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleRollenAnzeigen.click();
      await expect(RolleManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(RolleManagementView.text_h2_Rollenverwaltung).toBeVisible();
      await expect(RolleManagementView.table_header_Rollenname).toBeVisible();
      await expect(RolleManagementView.table_header_Rollenart).toBeVisible();
      await expect(RolleManagementView.table_header_Merkmale).toBeVisible();
      await expect(RolleManagementView.table_header_Administrationsebene).toBeVisible();
    });
  });

  test("Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen ", async ({ page }) => {
    const RolleCreationView = new RolleCreationViewPage(page);
    const ROLLENNAME = "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 } });
    const DIENSTSTELLENNUMMER = '1111111';
    const SCHULSTRUKTURKNOTEN = DIENSTSTELLENNUMMER + " (Testschule Schulportal)";
    const ROLLENART = "Leit";
    const Merkmal = "KoPers-Nr. ist Pflichtangabe";
    const AngebotA = "E-Mail";
    const AngebotB = "Schulportal-Administration";
    const AngebotC = "Kalender";
    const SystemrechtA = 'Darf Benutzer verwalten';
    const SystemrechtB = 'Darf Schulen verwalten';
    const SystemrechtC = 'Darf Klassen verwalten';

    await test.step(`Dialog Rolle anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/rollen/new');
    });

    await test.step(`Rolle anlegen`, async () => {
      await RolleCreationView.combobox_Schulstrukturknoten.click();

      await page.getByText(SCHULSTRUKTURKNOTEN, { exact: true }).click();
      await RolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART, { exact: true }).click();
      await RolleCreationView.input_Rollenname.fill(ROLLENNAME);
      await RolleCreationView.combobox_Merkmal.click();
      await page.getByText(Merkmal, { exact: true }).click();
      await RolleCreationView.combobox_Angebote.click();
      await page.getByText(AngebotA, { exact: true }).click();
      await page.getByText(AngebotB, { exact: true }).click();
      await page.getByText(AngebotC, { exact: true }).click();
      await RolleCreationView.combobox_Systemrechte.click();
      await page.getByText(SystemrechtA, { exact: true }).click();
      await page.getByText(SystemrechtB, { exact: true }).click();
      await page.getByText(SystemrechtC, { exact: true }).click();

      await RolleCreationView.button_RolleAnlegen.click();
    });

    await test.step(`Bestätigungsseite  prüfen`, async () => {
      await expect(RolleCreationView.text_h2_RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
      await expect(RolleCreationView.button_Schliessen).toBeVisible();
      await expect(RolleCreationView.text_success).toBeVisible();
      await expect(RolleCreationView.icon_success).toBeVisible();
      await expect(RolleCreationView.text_DatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
      await expect(RolleCreationView.label_Administrationsebene).toHaveText('Administrationsebene:');
      await expect(RolleCreationView.data_Administrationsebene).toHaveText(SCHULSTRUKTURKNOTEN);
      await expect(RolleCreationView.label_Rollenart).toHaveText('Rollenart:');
      await expect(RolleCreationView.data_Rollenart).toHaveText(ROLLENART);
      await expect(RolleCreationView.label_Rollenname).toHaveText('Rollenname:');
      await expect(RolleCreationView.data_Rollenname).toHaveText(ROLLENNAME);
      await expect(RolleCreationView.label_Merkmale).toHaveText('Merkmale:');
      await expect(RolleCreationView.data_Merkmale).toHaveText(Merkmal);
      await expect(RolleCreationView.label_Angebote).toHaveText('Zugeordnete Angebote:');
      await expect(RolleCreationView.data_Angebote).toContainText(AngebotA);
      await expect(RolleCreationView.data_Angebote).toContainText(AngebotB);
      await expect(RolleCreationView.data_Angebote).toContainText(AngebotC);
      await expect(RolleCreationView.label_Systemrechte).toHaveText('Systemrechte:');
      await expect(RolleCreationView.data_Systemrechte).toContainText(SystemrechtA + ', ' +  SystemrechtB + ', ' + SystemrechtC);
      await expect(RolleCreationView.button_WeitereRolleAnlegen).toBeVisible();
      await expect(RolleCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });

    await test.step(`Rolle wieder löschen`, async () => {
      const RollenID = await getRolleId(page, ROLLENNAME); 
      await deleteRolle(page, RollenID);
    });
  });
});