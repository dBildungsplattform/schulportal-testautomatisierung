import test, { PlaywrightTestArgs } from "@playwright/test";
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
import { LONG, SHORT, STAGE } from "../base/tags";

let loginPage: LoginViewPage;
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
    landingPage.navigateToLogin();
    
    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.firstLogin(username, password);
    await startPage.waitForPageLoad();
  
    // 2. Zur Seite navigieren
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });

  test.only('Seiteninhalte werden angezeigt',{ tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness();
  });  
});