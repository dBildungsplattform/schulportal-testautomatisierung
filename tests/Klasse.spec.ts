import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { KlasseCreationViewPage } from "../pages/admin/KlasseCreationView.page";
import { KlasseManagementViewPage } from "../pages/admin/KlasseManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE } from "../base/tags";
import { deleteClassByName } from "../base/testHelperDeleteTestdata.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let className: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
  
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
    await test.step(`Testdaten löschen via API`, async () => {
      if (className) { // nur wenn der Testfall auch mind. eine Klasse angelegt hat
        await deleteClassByName(className, page);
        className = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Klasse anschließend in der Ergebnisliste suchen und dann löschen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseCreationView = new KlasseCreationViewPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);
    const schulname = "Testschule Schulportal";
    const zufallsnummer = faker.number.bigInt({ min: 1000, max: 9000 })
    const klassenname = "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 }}) + zufallsnummer;

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.text_h2_KlasseAnlegen).toHaveText("Neue Klasse hinzufügen");
    });

    await test.step(`Klasse anlegen`, async () => {
      await klasseCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(schulname).click();
      await klasseCreationView.input_Klassenname.fill(klassenname);
      await klasseCreationView.button_KlasseAnlegen.click();
      await expect(klasseCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      await menue.menueItem_AlleKlassenAnzeigen.click(); 
      await klasseManagementView.combobox_Filter_Schule.fill(schulname);
      await page.getByText(`${schulname}`, { exact: true }).click();
      await klasseManagementView.text_h2_Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });

    await test.step(`Klasse löschen`, async () => {
      await page.getByRole('cell', { name: klassenname }).click();
      await page.getByTestId('open-klasse-delete-dialog-button').click();
      await page.getByTestId('klasse-delete-button').click();
      await page.getByTestId('close-klasse-delete-success-dialog-button').click();
    });
  });

  test("Ergebnisliste Klassen als Landesadmin auf Vollständigkeit prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);

    await test.step(`Klassenverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(klasseManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(klasseManagementView.text_h2_Klassenverwaltung).toHaveText("Klassenverwaltung");
      await expect(klasseManagementView.combobox_Filter_Schule).toBeVisible();
      await expect(klasseManagementView.combobox_Filter_Klasse).toBeVisible();
      await expect(klasseManagementView.table_header_Dienststellennummer).toBeVisible();
      await expect(klasseManagementView.table_header_Klassenname).toBeVisible();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen", {tag: [LONG, STAGE]}, async ({ page }) => {
    const klasseCreationView = new KlasseCreationViewPage(page);
    const dienststellennummer = '1111111';
    const nameSchule = "Testschule Schulportal";
    const zufallsnummer = faker.number.bigInt({ min: 1000, max: 9000 })
    const klasseName = "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 }}) + zufallsnummer;

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/klassen/new');
    });

    await test.step(`Klasse anlegen`, async () => {
      await klasseCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(nameSchule).click();
      await klasseCreationView.input_Klassenname.fill(klasseName);
      await klasseCreationView.button_KlasseAnlegen.click();
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(klasseCreationView.text_h2_KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
      await expect(klasseCreationView.button_Schliessen).toBeVisible();
      await expect(klasseCreationView.text_success).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
      className.push(klasseName);
      await expect(klasseCreationView.icon_success).toBeVisible();
      await expect(klasseCreationView.text_DatenGespeichert).toBeVisible();
      await expect(klasseCreationView.label_Schule).toBeVisible();
      await expect(klasseCreationView.data_Schule).toHaveText(dienststellennummer + ' (' + nameSchule + ')');
      await expect(klasseCreationView.label_Klasse).toBeVisible();
      await expect(klasseCreationView.data_Klasse).toHaveText(klasseName);
      await expect(klasseCreationView.button_WeitereKlasseAnlegen).toBeVisible();
      await expect(klasseCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });

  test("Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)", { tag: [LONG, SHORT, STAGE] }, async ({ page }) => {
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);
  
    await test.step(`Klassenverwaltung öffnen und prüfen, dass jede Klasse eine Dienststellennummer hat`, async () => {
      // Navigate to Klassenverwaltung
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
  
      // Wait until the table is visible
      await expect(klasseManagementView.text_h2_Klassenverwaltung).toHaveText("Klassenverwaltung");
  
      // Show first 100 entries
      await klasseManagementView.footerDataTable.combobox_AnzahlEintraege.click();
      await page.getByRole('option', { name: '100' }).click();
  
      // Check the first 100 entries
        const rows = klasseManagementView.tableRows;
        const rowCount = await rows.count();
  
        for (let i = 0; i < rowCount; i++) {
          const dienststellennummerCell = rows.nth(i).locator('td').nth(0);
          const klassennameCell = rows.nth(i).locator('td').nth(1);
  
          await expect(dienststellennummerCell).toBeVisible();
          await expect(dienststellennummerCell).not.toHaveText('---');
          await expect(klassennameCell).toBeVisible();
          await expect(klassennameCell).not.toBeEmpty();
        }
  
      // Go to the last page
      await klasseManagementView.footerDataTable.text_LetzteSeite.click();
        for (let i = 0; i < rowCount; i++) {
          const dienststellennummerCell = rows.nth(i).locator('td').nth(0);
          const klassennameCell = rows.nth(i).locator('td').nth(1);
  
          await expect(dienststellennummerCell).toBeVisible();
          await expect(dienststellennummerCell).not.toHaveText('---');
          await expect(klassennameCell).toBeVisible();
          await expect(klassennameCell).not.toBeEmpty();
        }
    });
  });
});