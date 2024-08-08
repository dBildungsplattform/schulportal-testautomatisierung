import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { SchuleCreationViewPage } from "../pages/admin/SchuleCreationView.page";
import { SchuleManagementViewPage } from "../pages/admin/SchuleManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { FooterDataTablePage } from "../pages/FooterDataTable.page ";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test.only("2 Schulen nacheinander anlegen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const SchuleCreationView = new SchuleCreationViewPage(page);
    const SchuleManagementView = new SchuleManagementViewPage(page);
    const FooterDataTable = new FooterDataTablePage(page);

    const SCHULNAME1 = "TAuto-PW-S1-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const SCHULNAME2 = "TAuto-PW-S2-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const DIENSTSTELLENNUMMER1 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
    const DIENSTSTELLENNUMMER2 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_h2_SchuleAnlegen).toHaveText("Neue Schule hinzufügen");
    });

    await test.step(`Erste Schule anlegen`, async () => {
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER1);
      await SchuleCreationView.input_Schulname.fill(SCHULNAME1);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Schule anlegen`, async () => {
      await SchuleCreationView.button_WeitereSchuleAnlegen.click();
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.click();
      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER2);

      await SchuleCreationView.input_Schulname.fill(SCHULNAME2);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die beiden neuen Schulen angezeigt werden`, async () => {
      await Menue.menueItem_AlleSchulenAnzeigen.click();
      await FooterDataTable.combobox_AnzahlEintraege.click();
      await page.getByText('300').click();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(page.getByRole("cell", { name: SCHULNAME1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: SCHULNAME2 })).toBeVisible();
    });
  });

  test("Ergebnisliste Schulen auf Vollständigkeit prüfen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const SchuleManagementView = new SchuleManagementViewPage(page);

    await test.step(`Schulverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleSchulenAnzeigen.click();
      await expect(SchuleManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(SchuleManagementView.table_header_Dienstellennummer).toBeVisible();
      await expect(SchuleManagementView.table_header_Schulname).toBeVisible();
    });
  });
});
