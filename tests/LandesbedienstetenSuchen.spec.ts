import test, { PlaywrightTestArgs } from "@playwright/test";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { freshLoginPage } from "../base/api/personApi";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;
let loginPage: LoginViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      // 1. Anmelden im Schulportal SH
      loginPage = await freshLoginPage(page);
      const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
      await startPage.waitForPageLoad();

      // 2. Zur Seite navigieren
      personManagementViewPage = await startPage.navigateToSchulportalAdministration();
      landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
      await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });
});