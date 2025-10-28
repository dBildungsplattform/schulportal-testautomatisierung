import test, { PlaywrightTestArgs, expect } from "@playwright/test";
import { freshLoginPage, lockPerson, UserInfo } from "../base/api/personApi";
import { LONG, SHORT, STAGE } from "../base/tags";
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, removeAllPersonenkontexte } from "../base/api/testHelperPerson.page";
import { ersatzTestschuleName, testschule665DstNrUndName, testschule665Name, testschuleDstNr, testschuleDstNrUndName, testschuleName } from "../base/organisation";
import { ersatzschulLehrkraftRolle, lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { generateKopersNr, generateNachname, generateVorname } from "../base/utils/generateTestdata";
import { LandesbedienstetenSuchenUndHinzufuegenPage } from "../pages/admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { StartViewPage } from "../pages/StartView.neu.page";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { SuchergebnisPopup } from "../pages/components/PersonSearchErrorPopup.page";
import { getOrganisationId } from "../base/api/organisationApi";
import { getRolleId } from "../base/api/rolleApi";

let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let personManagementViewPage: PersonManagementViewPage;
let landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage;
let header: HeaderPage;
let suchergebnisPopup: SuchergebnisPopup;
let lehrkraftMitSchulzuordnung: UserInfo;
let lehrkraftOhneSchulzuordnung: UserInfo;
let lehrkraft: UserInfo;
let lehrkraft1: UserInfo;
let lehrkraft2: UserInfo;
let lockedLehrkraft: UserInfo;
let lehrkraftDoppel1: UserInfo;
let lehrkraftDoppel2: UserInfo;
let ersatzschulLehrkraft: UserInfo;
let schuladmin1Schule: UserInfo;
let schuladmin2Schulen: UserInfo;

async function landesbedienstetenHinzufuegenAlsLehrkraft(
  landesbedienstetenSuchenUndHinzufuegenPage: LandesbedienstetenSuchenUndHinzufuegenPage): Promise<void> {
  await landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenSuchen.click();
  await landesbedienstetenSuchenUndHinzufuegenPage.buttonLandesbedienstetenHinzufuegen.click();
  //await landesbedienstetenSuchenUndHinzufuegenPage.rolleOeffnenButton.click();
  await landesbedienstetenSuchenUndHinzufuegenPage.rolleAutocomplete.selectByTitle('LiV');
  await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
  await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup.click();
}
/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit einer Schule xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe('Funktions- und UI Testfälle zu Landesbediensteten suchen und hinzufügen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    landesbedienstetenSuchenUndHinzufuegenPage = new LandesbedienstetenSuchenUndHinzufuegenPage(page);
    header = new HeaderPage(page);
    suchergebnisPopup = new SuchergebnisPopup(page);
    // Testdaten anlegen
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    schuladmin1Schule = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);

    const kopers1: string = await generateKopersNr();
    lehrkraft1 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers1);
    const kopers2: string = await generateKopersNr();
    lehrkraftMitSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers2);
    const kopers3: string = await generateKopersNr();
    lehrkraftOhneSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers3);
    const kopers4: string = await generateKopersNr();
    lehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers4);
    const kopers5: string = await generateKopersNr();
    lockedLehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers5);
    await lockPerson(page, lockedLehrkraft.personId, testschuleDstNr);
    const kopers6: string = await generateKopersNr();
    const vornameDoppelt: string = await generateVorname();
    const nachnameDoppelt: string = await generateNachname();
    lehrkraftDoppel1 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, vornameDoppelt, nachnameDoppelt, kopers6);
    const kopers7: string = await generateKopersNr();
    lehrkraftDoppel2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, vornameDoppelt, nachnameDoppelt, kopers7);
    ersatzschulLehrkraft = await createPersonWithPersonenkontext(page, ersatzTestschuleName, ersatzschulLehrkraftRolle);
    
    // Anmelden im Schulportal SH
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    // Erstmalige Anmeldung mit Passwortänderung  
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin1Schule.username, schuladmin1Schule.password);
    await startPage.waitForPageLoad();
    // Zur Seite navigieren
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSuchenUndHinzufuegenPage.waitForPageLoad();
  });
  /* 
    ---------------------------------- UI Testfälle ----------------------------------
  */
 //SPSH-2634 Step 7
  test('Schuladmin 1 Schule, Landesbediensteten hinzufügen: UI-Vollständigkeit und vorausgefüllte Daten', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenSuchen(lehrkraft1.username);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.pflichtfelderHinweisText).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.closeButtonX).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.formVornameInput).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.formNachnameInput).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.kopersnrInput).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.hasNoKopersnrCheckbox).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.organisationSelect).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.rollenSelect).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.abbrechenButton).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.personalInfoHeadline).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.organisationHeadline).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.rolleHeadline).toBeVisible();
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeDisabled();
    // Persönliche Daten sind vorausgefüllt
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.vornameTextInputfield).toHaveValue(lehrkraft1.vorname);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.nachnameTextInputfield).toHaveValue(lehrkraft1.familienname);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.kopersnrTextInputfield).toHaveValue(lehrkraft1.kopersnummer);
    // Organisation ist vorausgewählt
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.organisationSelect).toHaveText(testschuleDstNrUndName);
  });
  //SPSH-2630
  test('Seiteninhalte werden angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    expect(await landesbedienstetenSuchenUndHinzufuegenPage.checkForPageCompleteness()).toBe(true);
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
      await suchergebnisPopup.checkPopupCompleteness();
      await suchergebnisPopup.cancelButton.click();
    });
    await test.step('Suchen per Namen der Ersatzschullehrkraft', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(ersatzschulLehrkraft.vorname, ersatzschulLehrkraft.familienname);
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await suchergebnisPopup.checkPopupCompleteness();
    });
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
  //SPSH-2632 - Suchergebnis UI Test Landesbediensteten suchen (per Namen)
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
  /* 
    ----------------------------- Funktionale Testfälle ------------------------------
  */
  //SPSH-2633
  test('Buttons zum Zurücksetzen funktionieren', { tag: [LONG, SHORT, STAGE] }, async () => {
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
  // Gesperrte Person kann nicht gefunden werden
  test('Gesperrte Person kann nicht gefunden werden', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lockedLehrkraft.kopersnummer);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await expect(suchergebnisPopup.headline).toBeVisible();
  });
  // SPSH-2660 Step 1
  test('Landesbediensteten suchen per KoPers und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lehrkraftMitSchulzuordnung.kopersnummer);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftMitSchulzuordnung.vorname} ${lehrkraftMitSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toBeVisible();
  });

  //SPSH-2660 Step 3
  test('Landesbediensteten ohne Schulzuordnung suchen per Benutzername und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    await removeAllPersonenkontexte(page, lehrkraftOhneSchulzuordnung.personId);
    await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername(lehrkraftOhneSchulzuordnung.username);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftOhneSchulzuordnung.vorname} ${lehrkraftOhneSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toBeVisible();
  });

  // // SPSH-2660 Step 4
  test('Landesbediensteten suchen per Vorname und Nachname und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillVornameNachname(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname);
    await landesbedienstetenHinzufuegenAlsLehrkraft(landesbedienstetenSuchenUndHinzufuegenPage);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraftMitSchulzuordnung.vorname} ${lehrkraftMitSchulzuordnung.familienname} wurde erfolgreich hinzugefügt.`);
    await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toBeVisible();
  });
});

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit 2 Schulen xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/

test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit - Schuladmin 2 Schulen', () => {
  // alles speziell für Schuladmin mit 2 Schulen
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
  header = new HeaderPage(page);
  
  loginPage = await freshLoginPage(page);
  await loginPage.login(process.env.USER, process.env.PW);
  // Testdaten anlegen
  schuladmin2Schulen = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
  const testschuleID: string = await getOrganisationId(page, testschuleName);
  const testschule665ID: string = await getOrganisationId(page, testschule665Name);
  const schuladminRolleId: string = await getRolleId(page, schuladminOeffentlichRolle);
  await addSecondOrganisationToPerson(page, schuladmin2Schulen.personId, testschuleID, testschule665ID, schuladminRolleId);
  
  const kopers2 : string = await generateKopersNr();
  lehrkraft2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, kopers2);

  // Anmelden im Schulportal SH
  landingPage = await header.logout();
  landingPage.navigateToLogin();
  
  // Erstmalige Anmeldung mit Passwortänderung
  const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin2Schulen.username, schuladmin2Schulen.password);
  await startPage.waitForPageLoad();

  // Zur Seite navigieren und LB suchen
  personManagementViewPage = await startPage.goToAdministration();
  landesbedienstetenSuchenUndHinzufuegenPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
  await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenSuchen(lehrkraft2.username);
  });
  
  //SPSH-2634 Step 1
  test('Seite wird vollständig angezeigt: Schuladmin 2 Schulen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await test.step('Organisation nur aus zugewiesenen Organisationen auswählbar, UI Elemente werden angezeigt', async () => {
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.pflichtfelderHinweisText).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.closeButtonX).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.formVornameInput).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.formNachnameInput).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.kopersnrInput).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.hasNoKopersnrCheckbox).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.organisationSelect).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.abbrechenButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.personalInfoHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.organisationHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeDisabled();
      // Persönliche Daten sind vorausgefüllt
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.vornameTextInputfield).toHaveValue(lehrkraft2.vorname);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.nachnameTextInputfield).toHaveValue(lehrkraft2.familienname);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.kopersnrTextInputfield).toHaveValue(lehrkraft2.kopersnummer);
      // Organisationen sind eingeschränkt auswählbar
      await landesbedienstetenSuchenUndHinzufuegenPage.organisationOeffnenButton.click();
      const optionTexts: string[] = await landesbedienstetenSuchenUndHinzufuegenPage.organisationAutocomplete.allTextContents();
      const erwarteteOrganisationen: string[] = [testschuleDstNrUndName, testschule665DstNrUndName];
      expect(optionTexts).toEqual(expect.arrayContaining(erwarteteOrganisationen));
    });
    //SPSH-2634 Step 2
    await test.step('Nach Organisationsauswahl werden Rollenfelder angezeigt, Auswahl 2. Organisation im Dropdown', async () => {
      // Auswahl der zweiten Organisation
      await landesbedienstetenSuchenUndHinzufuegenPage.organisationAutocomplete.selectByName(testschule665DstNrUndName);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.rolleHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.rollenSelect).toBeVisible();
    });
    //SPSH-2634 Step 3
    await test.step('Befristung wird angezeigt bei Auswahl LiV', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.rolleOeffnenButton.click();
      await landesbedienstetenSuchenUndHinzufuegenPage.rolleAutocomplete.selectByTitle('LiV');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.befristungHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.befristungInput).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.bisSchuljahresendeRadio).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.unbefristetRadio).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.bisSchuljahresendeRadio).toBeChecked();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeEnabled();
    });
    //SPSH-2634 Step 4
    await test.step('Bestätigungs-Popup wird angezeigt mit korrektem Text', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
      await landesbedienstetenSuchenUndHinzufuegenPage.checkForBestaetigungspopupCompleteness();
      const confirmationText: string = await landesbedienstetenSuchenUndHinzufuegenPage.nachfragetextImBestaetigungsPopup.textContent();
      expect(confirmationText).toContain(`Wollen Sie ${lehrkraft2.username} als LiV hinzufügen?`);
    });
    //SPSH-2634 Step 5
    await test.step('Abbrechen im Bestätigungs-Popup funktioniert', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.abbrechenButtonImBestaetigungsPopup.click();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeEnabled();
    });
    //SPSH-2634 Step 6
    await test.step('Nach Bestätigung auf Popup wird die Card Landesbediensteten hinzufügen vollständig angezeigt', async () =>{
      await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
      await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup.click();
      
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraft2.vorname} ${lehrkraft2.familienname} wurde erfolgreich hinzugefügt.`);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.locator('.subtitle-2')).toHaveText('Folgende Daten wurden gespeichert:');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.zurGesamtuebersichtButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.zurGesamtuebersichtButton).toHaveText('Zur Gesamtübersicht');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.zurueckZurErgebnislisteButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.zurueckZurErgebnislisteButton).toHaveText('Zurück zur Ergebnisliste');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.weiterenLandesbedienstetenSuchenButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.weiterenLandesbedienstetenSuchenButton).toHaveText('Weiteren Landesbediensteten suchen');

      // Label zu Feldern auf der Card prüfen
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Vorname:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Nachname:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('KoPers.-Nr.:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Benutzername:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Organisationsebene:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Rolle:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByText('Befristung:', { exact: true })).toBeVisible();
      //Wert bei Befristung wird angezeigt, es wird nicht auf korrektem Datum geprüft
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-befristung')).toBeVisible();
      // Werte zu Feldern auf der Card prüfen
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-vorname')).toHaveText(lehrkraft2.vorname);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-familienname')).toHaveText(lehrkraft2.familienname);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-personalnummer')).toHaveText(lehrkraft2.kopersnummer);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-username')).toHaveText(lehrkraft2.username);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-organisation')).toHaveText(testschule665DstNrUndName);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.card.getByTestId('added-landesbediensteter-rolle')).toHaveText('LiV');
    });
  });
});