import test, { expect, PlaywrightTestArgs } from "@playwright/test";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { freshLoginPage, UserInfo } from "../base/api/personApi";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { createPersonWithPersonenkontext } from "../base/api/testHelperPerson.page";
import { testschuleName } from "../base/organisation";
import { schuladminOeffentlichRolle } from "../base/rollen";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";

let loginPage: LoginViewPage;
let loginPage2: LoginViewPage;
let landingPage: LandingViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;
let header: HeaderPage;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    // Testdaten anlegen
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    const userInfo: UserInfo = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const username: string = userInfo.username;
    const password: string = userInfo.password;
        
    // 1. Anmelden im Schulportal SH
    landingPage = await header.logout();
    loginPage2 = await landingPage.navigateToLogin();
    await loginPage2.waitForPageLoad();
    // Erstmalige Anmeldung mit Passwortänderung  
    const startPage: StartViewPage = await loginPage2.firstLogin(username, password);
    await startPage.waitForPageLoad();
  
    // 2. Zur Seite navigieren
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });

  test.only('Seiteninhalte werden angezeigt', async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness();
    expect(true).toBeTruthy();
  });
});