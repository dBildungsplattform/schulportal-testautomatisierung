import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { HeaderPage } from "../pages/Header.page";
import { LONG } from "../base/tags";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für den Benutzerimport": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login and navigate to Benutzerimport`, async () => {
      const landingPage = new LandingPage(page);

      await page.goto(FRONTEND_URL);
      const loginPage = await landingPage.goToLogin();
      const startPage = await loginPage.login(ADMIN, PW);
      const menuPage = await startPage.goToAdministration();
      const importPage = await menuPage.goToBenutzerImport();

      await expect(importPage.headlineBenutzerImport).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step(`Testdaten löschen via API`, async () => {
      // delete test data
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Als Landesadmin eine CSV-Datei mit Benutzerdaten hochladen und importieren", {tag: [LONG]}, async ({ page }) => {
    const schulname = "";
    const rollenname = "";
    const csvFile = "";

    await test.step(``, async () => {
      // upload CSV file
    });
  });
});