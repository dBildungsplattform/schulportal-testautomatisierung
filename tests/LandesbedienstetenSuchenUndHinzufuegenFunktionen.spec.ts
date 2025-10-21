import test, { PlaywrightTestArgs, expect } from "@playwright/test";
import { freshLoginPage, UserInfo } from "../base/api/personApi";
import { LONG, SHORT, STAGE } from "../base/tags";
import { createPersonWithPersonenkontext, removeAllPersonenkontexte } from "../base/api/testHelperPerson.page";
import { testschuleName } from "../base/organisation";
import { lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { generateKopersNr } from "../base/utils/generateTestdata";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { StartViewPage } from "../pages/StartView.neu.page";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { LandesbedienstetenHinzufuegenPage } from "../pages/admin/personen/creation/LandesbedienstetenHinzufuegen.page";

let loginPage: LoginViewPage;
let lehrkraftMitSchulzuordnung: UserInfo;
let lehrkraftOhneSchulzuordnung: UserInfo;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage;

async function landesbedienstetenHinzufuegenAlsLehrkraft(
  landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage,
  landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage
): Promise<void> {
  await landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenSuchen.click();
    await landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenHinzufuegen.click();
    await landesbedienstetenHinzufuegenPage.rolleOeffnenButton.click();
    await landesbedienstetenHinzufuegenPage.rolleAutocomplete.selectByTitle('LiV');
    await landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
    await landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup.click();
}

test.describe('Testfälle für die Funktion Landesbediensteten suchen und hinzufügen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    landesbedienstetenHinzufuegenPage = new LandesbedienstetenHinzufuegenPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    // Testdaten anlegen (Schuladmin)
    const adminUserInfo: UserInfo = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const schuladminUsername: string = adminUserInfo.username;
    const schuladminPassword: string = adminUserInfo.password;

    const kopers1: string = await generateKopersNr();
    const kopers2: string = await generateKopersNr();

    lehrkraftMitSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers1);
    lehrkraftOhneSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers2);
    
    // Anmelden im Schulportal SH
    const header: HeaderPage = new HeaderPage(page);
    const landingPage: LandingViewPage = await header.logout();
    landingPage.navigateToLogin();
    // Erstmalige Anmeldung mit Passwortänderung  
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladminUsername, schuladminPassword);
    await startPage.waitForPageLoad();
    // Zur Seite navigieren
    const personManagementViewPage: PersonManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });

  // SPSH-2660 Step 1
  test('Landesbediensteten suchen per KoPers und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lehrkraftMitSchulzuordnung.kopersnummer);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage, landesbedienstetenHinzufuegenPage);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftMitSchulzuordnung.vorname} ${lehrkraftMitSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toBeVisible();
  });

  //SPSH-2660 Step 3
  test('Landesbediensteten ohne Schulzuordnung suchen per Benutzername und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async ({ page }) => {
    await removeAllPersonenkontexte(page, lehrkraftOhneSchulzuordnung.personId);
    await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername(lehrkraftOhneSchulzuordnung.username);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage, landesbedienstetenHinzufuegenPage);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftOhneSchulzuordnung.vorname} ${lehrkraftOhneSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toBeVisible();
  });

  // // SPSH-2660 Step 4
  test('Landesbediensteten suchen per Vorname und Nachname und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage, landesbedienstetenHinzufuegenPage);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftMitSchulzuordnung.vorname} ${lehrkraftMitSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toBeVisible();
  });
});