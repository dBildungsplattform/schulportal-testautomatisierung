import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { KlasseCreationViewPage } from "../pages/admin/KlasseCreationView.page";
import { KlasseManagementViewPage } from "../pages/admin/KlasseManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test("Eine Klasse anlegen und die Klasse anschließend in der Ergebnisliste suchen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const KlasseCreationView = new KlasseCreationViewPage(page);
    const KlasseManagementView = new KlasseManagementViewPage(page);
    const SCHULNAME = "Testschule Schulportal";
    const KLASSENNAME = "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 }});

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_KlasseAnlegen.click();
      await expect(KlasseCreationView.text_h2_KlasseAnlegen).toHaveText("Neue Klasse hinzufügen");
    });

    await test.step(`Klasse anlegen`, async () => {
      await KlasseCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(SCHULNAME).click();
      await KlasseCreationView.input_Klassenname.fill(KLASSENNAME);
      await KlasseCreationView.button_KlasseAnlegen.click();
      await expect(KlasseCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      await Menue.menueItem_AlleKlassenAnzeigen.click();
      await KlasseManagementView.combobox_Filter_Schule.fill(SCHULNAME);    
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await KlasseManagementView.combobox_Filter_Klasse.fill(KLASSENNAME);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(KlasseManagementView.text_h2_Klassenverwaltung).toHaveText("Klassenverwaltung");
      await expect(page.getByRole("cell", { name: KLASSENNAME })).toBeVisible();
    });
  });

  test("Ergebnisliste Klassen auf Vollständigkeit prüfen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const KlasseManagementView = new KlasseManagementViewPage(page);

    await test.step(`Klassenverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(KlasseManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(KlasseManagementView.text_h2_Klassenverwaltung).toHaveText("Klassenverwaltung");
      await expect(KlasseManagementView.combobox_Filter_Schule).toBeVisible();
      await expect(KlasseManagementView.combobox_Filter_Klasse).toBeVisible();
      await expect(KlasseManagementView.table_header_Dienststellennummer).toBeVisible();
      await expect(KlasseManagementView.table_header_Klassenname).toBeVisible();
    });
  });

  test("Eine Klasse anlegen und die Bestätigungsseite vollständig prüfen", async ({ page }) => {
    const KlasseCreationView = new KlasseCreationViewPage(page);
    const DIENSTELLENNUMMER = '1111111';
    const SCHULNAME = "Testschule Schulportal";
    const KLASSENNAME = "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 }});

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await page.goto(FRONTEND_URL + 'admin/klassen/new');
    });

    await test.step(`Klasse anlegen`, async () => {
      await KlasseCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(SCHULNAME).click();
      await KlasseCreationView.input_Klassenname.fill(KLASSENNAME);
      await KlasseCreationView.button_KlasseAnlegen.click();
    });

    await test.step(`Bestätigunsseite prüfen`, async () => {
      await expect(KlasseCreationView.text_h2_KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
      await expect(KlasseCreationView.button_Schliessen).toBeVisible();
      await expect(KlasseCreationView.text_success).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
      await expect(KlasseCreationView.icon_success).toBeVisible();
      await expect(KlasseCreationView.text_DatenGespeichert).toBeVisible();
      await expect(KlasseCreationView.label_Schule).toBeVisible();
      await expect(KlasseCreationView.data_Schule).toHaveText(DIENSTELLENNUMMER + ' (' + SCHULNAME + ')');
      await expect(KlasseCreationView.label_Klasse).toBeVisible();
      await expect(KlasseCreationView.data_Klasse).toHaveText(KLASSENNAME);
      await expect(KlasseCreationView.button_WeitereKlasseAnlegen).toBeVisible();
      await expect(KlasseCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });
});