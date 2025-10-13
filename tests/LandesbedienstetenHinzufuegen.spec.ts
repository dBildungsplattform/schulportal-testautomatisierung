import test, { PlaywrightTestArgs } from "@playwright/test";
import { freshLoginPage, UserInfo } from "../base/api/personApi";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext } from "../base/api/testHelperPerson.page";
import { testschule665DstNrUndName, testschule665Name, testschuleDstNrUndName, testschuleName } from "../base/organisation";
import { lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { LandesbedienstetenHinzufuegenPage } from "../pages/admin/personen/creation/LandesbedienstetenHinzufuegen.page";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { expect } from "@playwright/test";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page";
import { getRolleId } from "../base/api/testHelperRolle.page";
import { generateKopersNr } from "../base/utils/generateTestdata";


let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;
let header: HeaderPage;
let lehrkraft1: UserInfo;
let lehrkraft2: UserInfo;
let schuladmin1Schule: UserInfo;
let schuladmin2Schulen: UserInfo;

test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit - Schuladmin 1 Schule', () => {
  // alles speziell für Schuladmin mit 1 Schule
   test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    // Testdaten anlegen (Schuladmin)
    schuladmin1Schule = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    // Lehrkraft
    const kopers1 : string = await generateKopersNr();
    lehrkraft1 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers1);

    //  Anmelden im Schulportal SH
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin1Schule.username, schuladmin1Schule.password);
    await startPage.waitForPageLoad();
  
    // Zur Seite navigieren und LB suchen
    landesbedienstetenHinzufuegenPage = new LandesbedienstetenHinzufuegenPage(page);
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    // Zur Seite Landesbediensteten hinzufügen navigieren
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenSuchen(lehrkraft1.username);
    await landesbedienstetenHinzufuegenPage.waitForPageLoad();
  });

    test('Schuladmin 1 Schule: UI-Vollständigkeit und vorausgefüllte Daten', async () => {
    await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(landesbedienstetenHinzufuegenPage.pflichtfelderHinweisText).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
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
    await expect(landesbedienstetenHinzufuegenPage.vornameTextInputfield).toHaveValue(lehrkraft1.vorname);
    await expect(landesbedienstetenHinzufuegenPage.nachnameTextInputfield).toHaveValue(lehrkraft1.familienname);
    await expect(landesbedienstetenHinzufuegenPage.kopersnrTextInputfield).toHaveValue(lehrkraft1.kopersnummer);
    // Organisation ist vorausgewählt
    await expect(landesbedienstetenHinzufuegenPage.organisationSelect).toHaveText(testschuleDstNrUndName);
  });

});
test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit - Schuladmin 2 Schulen', () => {
  // alles speziell für Schuladmin mit 2 Schulen
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    // Testdaten anlegen (Schuladmin)
    schuladmin2Schulen = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const testschuleID: string = await getOrganisationId(page, testschuleName);
    const testschule665ID: string = await getOrganisationId(page, testschule665Name);
    const schuladminRolleId: string = await getRolleId(page, schuladminOeffentlichRolle);
    await addSecondOrganisationToPerson(page, schuladmin2Schulen.personId, testschuleID, testschule665ID, schuladminRolleId);
    // Lehrkraft
    const kopers2 : string = await generateKopersNr();
    lehrkraft2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers2);

    // 1. Anmelden im Schulportal SH
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin2Schulen.username, schuladmin2Schulen.password);
    await startPage.waitForPageLoad();
  
    // 2. Zur Seite navigieren und LB suchen
    landesbedienstetenHinzufuegenPage = new LandesbedienstetenHinzufuegenPage(page);
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenSuchen(lehrkraft2.username);
    await landesbedienstetenHinzufuegenPage.waitForPageLoad();
  });
  
  test('Schuladmin 2 Schulen: Organisationen auswählbar', async () => {
    await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(landesbedienstetenHinzufuegenPage.pflichtfelderHinweisText).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
    await expect(landesbedienstetenHinzufuegenPage.closeButtonDesktop).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.vornameInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.nachnameInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.kopersnrInput).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.hasNoKopersnrCheckbox).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.organisationSelect).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.abbrechenButton).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.personalInfoHeadline).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.organisationHeadline).toBeVisible();
    await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeDisabled();
    // Persönliche Daten sind vorausgefüllt
    await expect(landesbedienstetenHinzufuegenPage.vornameTextInputfield).toHaveValue(lehrkraft2.vorname);
    await expect(landesbedienstetenHinzufuegenPage.nachnameTextInputfield).toHaveValue(lehrkraft2.familienname);
    await expect(landesbedienstetenHinzufuegenPage.kopersnrTextInputfield).toHaveValue(lehrkraft2.kopersnummer);
    // Organisationen sind eingeschränkt auswählbar
    await landesbedienstetenHinzufuegenPage.organisationSelect.click();
    const optionTexts: string[] = await landesbedienstetenHinzufuegenPage.organisationAutocomplete.allTextContents();
    const erwarteteOrganisationen: string[] = [testschuleDstNrUndName, testschule665DstNrUndName];
    expect(optionTexts).toEqual(expect.arrayContaining(erwarteteOrganisationen));
  });
});
