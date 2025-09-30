import test, { expect, PlaywrightTestArgs } from "@playwright/test";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { freshLoginPage, UserInfo } from "../base/api/personApi";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { createPersonWithPersonenkontext } from "../base/api/testHelperPerson.page";
import { testschuleName } from "../base/organisation";
import { schuladminOeffentlichRolle } from "../base/rollen";

let loginPage: LoginViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    // Testdaten anlegen
    const userInfo: UserInfo = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const username: string = userInfo.username;
    const password: string = userInfo.password;
    
    // 1. Anmelden im Schulportal SH
    loginPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.firstLogin(username, password);
    await startPage.waitForPageLoad();

    // 2. Zur Seite navigieren
    personManagementViewPage = await startPage.navigateToSchulportalAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });
});

test.only('Seiteninhalte werden angezeigt', async () => {
  expect(await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness()).toBeTruthy();
});