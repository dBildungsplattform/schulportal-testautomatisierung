import test, { expect, PlaywrightTestArgs } from "@playwright/test";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { freshLoginPage, lockPerson, UserInfo } from "../base/api/personApi";
import { StartViewPage } from "../pages/StartView.neu.page";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { createPersonWithPersonenkontext } from "../base/api/testHelperPerson.page";
import { lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";
import { SuchergebnisPopup } from "../pages/components/PersonSearchErrorPopup.page";
import { testschuleDstNr, testschuleName } from "../base/organisation";
import { LONG, SHORT, STAGE } from "../base/tags";

let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let personManagementViewPage: PersonManagementViewPage;
let header: HeaderPage;
let suchergebnisPopup: SuchergebnisPopup;
let lehrkraft: UserInfo;
let lockedLehrkraft: UserInfo;
let lehrkraftDoppel1: UserInfo;
let lehrkraftDoppel2: UserInfo;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    suchergebnisPopup = new SuchergebnisPopup(page);
    // Testdaten anlegen (Schuladmin)
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    const adminUserInfo: UserInfo = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
    const schuladminUsername: string = adminUserInfo.username;
    const schuladminPassword: string = adminUserInfo.password;
    // Lehrkraft
    lehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, "87654321");
    lockedLehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, "98765432");
    await lockPerson(page, lockedLehrkraft.personId, testschuleDstNr);
    lehrkraftDoppel1 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, "TAutoMax", "TAutoMustermann", "3219876");
    lehrkraftDoppel2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, "TAutoMax", "TAutoMustermann", "3219875");
            
    // 1. Anmelden im Schulportal SH
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    
    // Erstmalige Anmeldung mit Passwortänderung  
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladminUsername, schuladminPassword);
    await startPage.waitForPageLoad();
  
    // 2. Zur Seite navigieren
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });

  //SPSH-2630
  test('Seiteninhalte werden angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    expect(await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness()).toBeTruthy();
  });

  //SPSH-2631 Step 1
  //Das Feld Nachname wird rot umrandet und es steht darunter die Aufforderung: Der Nachname ist erforderlich.
  test('Nachname ist ein Pflichtfeld', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname("zzzzz", "");
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.errorNachname).toHaveText("Der Nachname ist erforderlich.");
  });
  //SPSH-2631 Step 2
  //Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde: falsche Namen 
  //Es wird das Popup Suchergebnis angezeigt, mit Text und Abbrechen Button
  test('Kein Treffer wegen falschen Namen: Popup wird angezeigt und ist vollständig', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname("zzzzz", "yyyyy");
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await suchergebnisPopup.checkPopupCompleteness();
    await expect(suchergebnisPopup.noPersonFoundText).toHaveText('Es wurde leider kein Treffer gefunden. Bitte prüfen Sie Ihre Eingabe. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
    await expect(suchergebnisPopup.cancelButton).toHaveText('Abbrechen');
  });
  //SPSH-2631 Step 3 - 5
  // Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde
  test('Kein Treffer: Popup wird angezeigt und kann geschlossen werden (KoPersNr, Email, Benutzername)', { tag: [LONG, SHORT, STAGE] }, async () => {
    await test.step('Suchen per KoPers.-Nr.', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr("abc9999");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await suchergebnisPopup.checkPopupCompleteness();
      await suchergebnisPopup.cancelButton.click();
    });

    await test.step('Suchen per E-Mail', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillEmail("nicht@existiert.de");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await suchergebnisPopup.checkPopupCompleteness();
      await suchergebnisPopup.cancelButton.click();
    });

    await test.step('Suchen per Benutzername', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername("unbekannt123");
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      expect(await suchergebnisPopup.checkPopupCompleteness()).toBeTruthy();
   });
  });

  // Gesperrte Person kann nicht gefunden werden
  test('Gesperrte Person kann nicht gefunden werden', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lockedLehrkraft.kopersnummer);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await suchergebnisPopup.checkPopupCompleteness();
  });

  // Doppelter Name Fehlermeldung (!) Wir verwenden absichtlich die Namen der 2 Lehrkräfte, 
  // damit wir keinen Eslint Fehler bekommen, weil die 2. Lehrkraft nie benutzt wird.
  test('Doppelter Name: Fehlermeldung wird angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(lehrkraftDoppel1.vorname, lehrkraftDoppel2.familienname);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await suchergebnisPopup.checkPopupCompleteness();
    await expect(suchergebnisPopup.noPersonFoundText).toHaveText('Es wurde mehr als ein Treffer gefunden. Bitte verwenden Sie zur Suche die KoPers.-Nr., die Landes-Mailadresse oder den Benutzernamen. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
    await expect(suchergebnisPopup.cancelButton).toHaveText('Abbrechen');
  });

  //SPSH-2632 - Suchergebnis UI Test & Happy Path Landesbediensteten per Namen suchen
  test('Persönliche Daten und Zuordnung werden korrekt angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    const lehrFullname: string = lehrkraft.vorname + " " + lehrkraft.familienname;
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(lehrkraft.vorname, lehrkraft.familienname);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.suchergebnisCardHeadline).toHaveText('Suchergebnis');
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenHinzufuegen).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.buttonZurueckZurSuche).toBeVisible();
    // Card Persönliche Daten prüfen
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.personalDataHeadline).toHaveText('Persönliche Daten');
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardFullname).toHaveText(lehrFullname);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardUsername).toHaveText(lehrkraft.username);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardKopersnummer).toHaveText(lehrkraft.kopersnummer);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardEmail).toHaveText(lehrkraft.email);

    // Card Schulzuordnung prüfen
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.zuordnungHeadline).toHaveText('Schulzuordnung');
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.zCardOrganisation).toHaveText(testschuleName);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.zCardRolle).toHaveText(lehrkraftOeffentlichRolle);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.zCardDienststellennummer).toHaveText(testschuleDstNr);
  });

  //SPSH-2633
  test.only('Buttons zum Zurücksetzen funktionieren', { tag: [LONG, SHORT, STAGE] }, async () => {
    const lehrFullname: string = lehrkraft.vorname + " " + lehrkraft.familienname;
    await test.step ('Button Zurück zur Suche funktioniert', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(lehrkraft.vorname, lehrkraft.familienname);
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardFullname).toHaveText(lehrFullname);
      await landesbedienstetenSuchenUndHinzufuegenPage.buttonZurueckZurSuche.click();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardFullname).toBeHidden();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.nameRadioButton).toBeChecked();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.vornameInputField).toHaveValue(lehrkraft.vorname);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.nachnameInputField).toHaveValue(lehrkraft.familienname);
    });
    await test.step ('Button Zurücksetzen funktioniert', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardFullname).toHaveText(lehrFullname);
      await landesbedienstetenSuchenUndHinzufuegenPage.buttonZuruecksetzen.click();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.pCardFullname).toBeHidden();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.nameRadioButton).toBeChecked();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.vornameInputField).toBeEmpty();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.nachnameInputField).toBeEmpty();
    });
  });
});