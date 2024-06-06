import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { RolleCreationViewPage } from "../pages/admin/RolleCreationView.page";
import { RolleManagementViewPage } from "../pages/admin/RolleManagementView.page";
import { HelperPage } from "../pages/Helper.page";

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

  test("2 Rollen nacheinander anlegen", async ({ page }) => {
    const Startseite = new StartPage(page);
    const Menue = new MenuPage(page);
    const RolleCreationView = new RolleCreationViewPage(page);
    const RolleManagementView = new RolleManagementViewPage(page);
    const Helper = new HelperPage();

    const ROLLENNAME1 = "TAuto-PW-R1-" + (await Helper.generateRandomString(10));
    const ROLLENNAME2 = "TAuto-PW-R2-" + (await Helper.generateRandomString(10));
    const SCHULSTRUKTURKNOTEN1 = "Wurzel Land Schleswig Holstein";
    const SCHULSTRUKTURKNOTEN2 = "Amalie-Sieveking-Schule";
    const ROLLENART1 = "Lern";
    const ROLLENART2 = "Lehr";

    await test.step(`Dialog Rolle anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_RolleAnlegen.click();
      await expect(RolleCreationView.text_h2_RolleAnlegen).toHaveText("Neue Rolle hinzufügen");
    });

    await test.step(`Erste Rolle anlegen`, async () => {
      await RolleCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(`${SCHULSTRUKTURKNOTEN1}`).click();

      await RolleCreationView.combobox_Rollenart.click();
      await page.getByText(`${ROLLENART1}`).click();

      await RolleCreationView.input_Rollenname.fill(ROLLENNAME1);
      await RolleCreationView.button_RolleAnlegen.click();
      await expect(RolleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Rolle anlegen`, async () => {
      await RolleCreationView.button_WeitereRolleAnlegen.click();
      await RolleCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(`${SCHULSTRUKTURKNOTEN2}`).click();

      await RolleCreationView.combobox_Rollenart.click();
      await page.getByText(`${ROLLENART2}`).click();

      await RolleCreationView.input_Rollenname.fill(ROLLENNAME2);
      await RolleCreationView.button_RolleAnlegen.click();
      await expect(RolleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
      await Menue.menueItem_AlleRollenAnzeigen.click();
      await expect(RolleManagementView.text_h2_Rollenverwaltung).toHaveText("Rollenverwaltung");
      await expect(page.getByRole("cell", { name: ROLLENNAME1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: ROLLENNAME2 })).toBeVisible();
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
});
