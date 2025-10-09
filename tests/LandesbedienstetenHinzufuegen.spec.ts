import test, { PlaywrightTestArgs } from "@playwright/test";
import { freshLoginPage, UserInfo } from "../base/api/personApi";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { createPersonWithPersonenkontext } from "../base/api/testHelperPerson.page";
import { testschuleDstNrUndName, testschuleName } from "../base/organisation";
import { lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { LandesbedienstetenHinzufuegenPage } from "../pages/admin/personen/creation/LandesbedienstetenHinzufuegen.page";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { expect } from "@playwright/test";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";

let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;
let header: HeaderPage;
let lehrkraft: UserInfo;

test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    // Testdaten anlegen (Schuladmin)
    const adminUserInfo: UserInfo = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const schuladminUsername: string = adminUserInfo.username;
    const schuladminPassword: string = adminUserInfo.password;
    // Lehrkraft
    lehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, "87654321");


    // 1. Anmelden im Schulportal SH
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    
    // Erstmalige Anmeldung mit Passwortänderung  
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladminUsername, schuladminPassword);
    await startPage.waitForPageLoad();
  
    // 2. Zur Seite navigieren und LB suchen
    landesbedienstetenHinzufuegenPage = new LandesbedienstetenHinzufuegenPage(page);
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
    await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername(lehrkraft.username);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenHinzufuegen.click();
    await landesbedienstetenHinzufuegenPage.waitForPageLoad();
  });

  test('Schuladmin 1 Schule: UI-Vollständigkeit und vorausgefüllte Daten', async () => {
    await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(landesbedienstetenHinzufuegenPage.closeButtonDesktop).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.vornameInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.nachnameInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.kopersnrInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.hasNoKopersnrCheckbox).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.organisationSelect).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.rollenSelect).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.abbrechenButton).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.personalInfoHeadline).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.organisationHeadline).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.rolleHeadline).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeDisabled();
    // Persönliche Daten sind vorausgefüllt
    await expect(landesbedienstetenHinzufuegenPage.vornameTextInputfield).toHaveValue(lehrkraft.vorname);
    await expect(landesbedienstetenHinzufuegenPage.nachnameTextInputfield).toHaveValue(lehrkraft.familienname);
    await expect(landesbedienstetenHinzufuegenPage.kopersnrTextInputfield).toHaveValue(lehrkraft.kopersnummer);
    // Organisation ist vorausgewählt
    await expect(landesbedienstetenHinzufuegenPage.organisationSelect).toHaveText(testschuleDstNrUndName);
  });
  
});
