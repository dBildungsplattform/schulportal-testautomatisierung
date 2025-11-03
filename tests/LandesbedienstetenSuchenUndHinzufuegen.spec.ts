import test, { PlaywrightTestArgs, expect } from "@playwright/test";
import { freshLoginPage, lockPerson, UserInfo } from "../base/api/personApi";
import { LONG, SHORT, STAGE } from "../base/tags";
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, removeAllPersonenkontexte } from "../base/api/personApi";
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
    await landesbedienstetenSuchenUndHinzufuegenPage.checkCreationForm(lehrkraft1.vorname, lehrkraft1.familienname, lehrkraft1.kopersnummer, testschuleDstNrUndName);
  });

  //SPSH-2630
  test('Seiteninhalte werden angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    expect(await landesbedienstetenSuchenUndHinzufuegenPage.checkSearchForm()).toBe(true);
  });

  //SPSH-2631 Step 1
  test('Vorname ist ein Pflichtfeld', { tag: [LONG, SHORT, STAGE] }, async () => {
    landesbedienstetenSuchenUndHinzufuegenPage.checkMandatoryFieldsForNameSearch('', 'zzzzz');
  });
  test('Nachname ist ein Pflichtfeld', { tag: [LONG, SHORT, STAGE] }, async () => {
    landesbedienstetenSuchenUndHinzufuegenPage.checkMandatoryFieldsForNameSearch('zzzzz', '');
  });

  //SPSH-2631 Step 2
  //Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde: falsche Namen 
  //Es wird das Popup Suchergebnis angezeigt, mit Text und Abbrechen Button
  test('Kein Treffer wegen falschen Namen: Popup wird angezeigt und ist vollständig', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillName("zzzzz", "yyyyy");
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
      await landesbedienstetenSuchenUndHinzufuegenPage.fillName(ersatzschulLehrkraft.vorname, ersatzschulLehrkraft.familienname);
      await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
      await suchergebnisPopup.checkPopupCompleteness();
    });
  });

  // Doppelter Name Fehlermeldung (!) Wir verwenden absichtlich die Namen der 2 Lehrkräfte, 
  // damit wir keinen Eslint Fehler bekommen, weil die 2. Lehrkraft nie benutzt wird.
  test('Doppelter Name: Fehlermeldung wird angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillName(lehrkraftDoppel1.vorname, lehrkraftDoppel2.familienname);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await suchergebnisPopup.checkPopupCompleteness();
    await expect(suchergebnisPopup.noPersonFoundText).toHaveText('Es wurde mehr als ein Treffer gefunden. Bitte verwenden Sie zur Suche die KoPers.-Nr., die Landes-Mailadresse oder den Benutzernamen. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
    await expect(suchergebnisPopup.cancelButton).toHaveText('Abbrechen');
  });

  //SPSH-2632 - Suchergebnis UI Test Landesbediensteten suchen (per Namen)
  test('Persönliche Daten und Zuordnung werden korrekt angezeigt', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillName(lehrkraft.vorname, lehrkraft.familienname);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();

    const lehrkraftFullName: string = `${lehrkraft.vorname} ${lehrkraft.familienname}`;
    landesbedienstetenSuchenUndHinzufuegenPage.checkSearchResultCard();
    landesbedienstetenSuchenUndHinzufuegenPage.checkPersonalDataCard(lehrkraftFullName, lehrkraft.username, lehrkraft.kopersnummer, lehrkraft.email);
    // TODO: rewrite this function to iterate all zuordnungen
    landesbedienstetenSuchenUndHinzufuegenPage.checkZuordnungCards(testschuleName, lehrkraftOeffentlichRolle, testschuleDstNr);
  });

  /* 
    ----------------------------- Funktionale Testfälle ------------------------------
  */
  //SPSH-2633
  test('Buttons zum Zurücksetzen funktionieren', { tag: [LONG, SHORT, STAGE] }, async () => {
    await test.step ('Button Zurück zur Suche funktioniert', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.searchByName(lehrkraft.vorname, lehrkraft.familienname);
      await landesbedienstetenSuchenUndHinzufuegenPage.goBackToSearchForm(lehrkraft.vorname, lehrkraft.familienname);      
    });
    await test.step ('Button Zurücksetzen funktioniert', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.resetSearchForm();
    });
  });
  // Gesperrte Person kann nicht gefunden werden
  test('Gesperrte Person kann nicht gefunden werden', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lockedLehrkraft.kopersnummer);
    await landesbedienstetenSuchenUndHinzufuegenPage.clickSearch();
    await expect(suchergebnisPopup.headline).toBeVisible();
  });
  // SPSH-2660 Step 1
  test('Landesbediensteten per KoPers suchen und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillKopersNr(lehrkraftMitSchulzuordnung.kopersnummer);
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenAlsLehrkraft();
    await landesbedienstetenSuchenUndHinzufuegenPage.checkSuccessPage(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname, lehrkraftMitSchulzuordnung.kopersnummer, lehrkraftMitSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
  });

  //SPSH-2660 Step 3
  test('Landesbediensteten ohne Schulzuordnung suchen per Benutzername und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    await removeAllPersonenkontexte(page, lehrkraftOhneSchulzuordnung.personId);
    await landesbedienstetenSuchenUndHinzufuegenPage.fillBenutzername(lehrkraftOhneSchulzuordnung.username);
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenAlsLehrkraft();
    await landesbedienstetenSuchenUndHinzufuegenPage.checkSuccessPage(lehrkraftOhneSchulzuordnung.vorname, lehrkraftOhneSchulzuordnung.familienname, lehrkraftOhneSchulzuordnung.kopersnummer, lehrkraftOhneSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
  });

  // // SPSH-2660 Step 4
  test('Landesbediensteten suchen per Vorname und Nachname und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await landesbedienstetenSuchenUndHinzufuegenPage.fillName(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname);
    await landesbedienstetenSuchenUndHinzufuegenPage.landesbedienstetenHinzufuegenAlsLehrkraft();
    await landesbedienstetenSuchenUndHinzufuegenPage.checkSuccessPage(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname, lehrkraftMitSchulzuordnung.kopersnummer, lehrkraftMitSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
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
      await landesbedienstetenSuchenUndHinzufuegenPage.checkCreationForm(lehrkraft2.vorname, lehrkraft2.familienname, lehrkraft2.kopersnummer, testschuleDstNrUndName);
      await landesbedienstetenSuchenUndHinzufuegenPage.checkSelectableOrganisationen([testschuleDstNrUndName, testschule665DstNrUndName]);
    });
    //SPSH-2634 Step 2
    await test.step('Nach Organisationsauswahl werden Rollenfelder angezeigt, Auswahl 2. Organisation im Dropdown', async () => {
      // Auswahl der zweiten Organisation
      await landesbedienstetenSuchenUndHinzufuegenPage.organisationAutocomplete.selectByName(testschule665DstNrUndName);
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.rolleHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.rolleAutocomplete.isVisible()).toBeTruthy();
    });
    //SPSH-2634 Step 3
    await test.step('Befristung wird angezeigt bei Auswahl LiV', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.rolleAutocomplete.selectByTitle('LiV');
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.befristungHeadline).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.befristungInput).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.schuljahresendeRadioButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.unbefristetRadioButton).toBeVisible();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.schuljahresendeRadioButton).toBeChecked();
      await expect(landesbedienstetenSuchenUndHinzufuegenPage.submitLandesbedienstetenHinzufuegenButton).toBeEnabled();
    });
    //SPSH-2634 Step 4
    await test.step('Bestätigungs-Popup wird angezeigt mit korrektem Text', async () => {
      await landesbedienstetenSuchenUndHinzufuegenPage.submitLandesbedienstetenHinzufuegenButton.click();
      await landesbedienstetenSuchenUndHinzufuegenPage.checkForBestaetigungspopupCompleteness();
      const confirmationText: string = await landesbedienstetenSuchenUndHinzufuegenPage.confirmationDialogText.textContent();
      expect(confirmationText).toContain(`Wollen Sie ${lehrkraft2.username} als LiV hinzufügen?`);
    });
    //SPSH-2634 Step 5
    await test.step('Abbrechen im Bestätigungs-Popup funktioniert', async () => {
      landesbedienstetenSuchenUndHinzufuegenPage.cancelConfirmationDialog();
    });
    //SPSH-2634 Step 6
    await test.step('Nach Bestätigung auf Popup wird das Success Template vollständig angezeigt', async () =>{
      await landesbedienstetenSuchenUndHinzufuegenPage.confirmLandesbedienstetenHinzufuegen();
      await landesbedienstetenSuchenUndHinzufuegenPage.checkCreationForm(lehrkraft2.vorname, lehrkraft2.familienname, lehrkraft2.kopersnummer, testschuleDstNrUndName);
      await landesbedienstetenSuchenUndHinzufuegenPage.checkSuccessPage(lehrkraft2.vorname, lehrkraft2.familienname, lehrkraft2.kopersnummer, lehrkraft2.username, testschuleDstNrUndName);
    });
  });
});