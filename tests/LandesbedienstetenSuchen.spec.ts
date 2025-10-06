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
import { PersonSearchErrorPopup } from "../pages/components/PersonSearchErrorPopup.page";

let loginPage: LoginViewPage;
let loginPage2: LoginViewPage;
let landingPage: LandingViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;
let header: HeaderPage;
let popup: PersonSearchErrorPopup;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    popup = new PersonSearchErrorPopup(page);
    // Testdaten anlegen (Schuladmin)
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

  //SPSH-2630
  test('Seiteninhalte werden angezeigt', async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness();
    expect(true).toBeTruthy();
  });

  //SPSH-2631 Step 1
  //Das Feld Nachname wird rot umrandet und es steht darunter die Aufforderung: Der Nachname ist erforderlich.
  test('Nachname ist ein Pflichtfeld', async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname("zzzzz", "");
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.errorNachname).toHaveText("Der Nachname ist erforderlich.");
  });
  //SPSH-2631 Step 2
  //Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde: falsche Namen 
  //Es wird das Popup Suchergebnis angezeigt, mit Text und Abbrechen Button
  test('Kein Treffer wegen falschen Namen: Popup wird angezeigt und ist vollständig', async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname("zzzzz", "yyyyy");
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await popup.checkPopupCompleteness();
    await expect(popup.noPersonFoundText).toHaveText('Es wurde leider kein Treffer gefunden. Bitte prüfen Sie Ihre Eingabe. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
    await expect(popup.cancelButton).toHaveText('Abbrechen');
  });
  //SPSH-2631 Step 3 - 5
  // Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde
  test('Kein Treffer: Popup wird angezeigt und kann geschlossen werden (KoPersNr, Email, Benutzername)', async () => {
    await test.step('Suchen per KoPers.-Nr.', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr("abc9999");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await popup.checkPopupCompleteness();
      await popup.cancelButton.click();
    });

    await test.step('Suchen per E-Mail', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillEmail("nicht@existiert.de");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await popup.checkPopupCompleteness();
      await popup.cancelButton.click();
    });

    await test.step('Suchen per Benutzername', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername("unbekannt123");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await popup.checkPopupCompleteness();
      expect(true).toBeTruthy();
   });
  });
});