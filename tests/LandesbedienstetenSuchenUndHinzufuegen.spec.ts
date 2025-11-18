import test, { PlaywrightTestArgs, expect } from "@playwright/test";
import { freshLoginPage, lockPerson, UserInfo } from "../base/api/personApi";
import { LONG, SHORT, STAGE, DEV, BROWSER } from "../base/tags";
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, removeAllPersonenkontexte } from "../base/api/personApi";
import { ersatzTestschuleName, testschule665DstNrUndName, testschule665Name, testschuleDstNr, testschuleDstNrUndName, testschuleName } from "../base/organisation";
import { ersatzschulLehrkraftRolle, lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from "../base/rollen";
import { generateKopersNr, generateNachname, generateVorname } from "../base/utils/generateTestdata";
import { LandesbedienstetenSearchFormPage } from "../pages/admin/personen/search/LandesbedienstetenSearchForm.page";
import { LoginViewPage } from "../pages/LoginView.neu.page";
import { LandingViewPage } from "../pages/LandingView.neu.page";
import { HeaderPage } from "../pages/components/Header.neu.page";
import { StartViewPage } from "../pages/StartView.neu.page";
import { PersonManagementViewPage } from "../pages/admin/personen/PersonManagementView.neu.page";
import { SearchResultErrorDialog } from "../pages/components/SearchResultErrorDialog";
import { getOrganisationId } from "../base/api/organisationApi";
import { getRolleId } from "../base/api/rolleApi";

let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let personManagementViewPage: PersonManagementViewPage;
let landesbedienstetenSearchPage: LandesbedienstetenSearchFormPage;
let header: HeaderPage;
let searchResultErrorDialog: SearchResultErrorDialog;
let lehrkraftMitSchulzuordnung: UserInfo;
let lehrkraftOhneSchulzuordnung: UserInfo;
let lehrkraft: UserInfo;
let lehrkraft2: UserInfo;
let lockedLehrkraft: UserInfo;
let lehrkraftDoppel1: UserInfo;
let lehrkraftDoppel2: UserInfo;
let ersatzschulLehrkraft: UserInfo;
let schuladmin1Schule: UserInfo;
let schuladmin2Schulen: UserInfo;


test.describe('UI Test zu Landesbediensteten suchen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    landesbedienstetenSearchPage = new LandesbedienstetenSearchFormPage(page);
    header = new HeaderPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    schuladmin1Schule = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);

    landingPage = await header.logout();
    landingPage.navigateToLogin();
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin1Schule.username, schuladmin1Schule.password);
    await startPage.waitForPageLoad();
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSearchPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSearchPage.waitForPageLoad();
  });
  //SPSH-2630
  test('Landesbediensteten (suchen und hinzufügen): UI prüfen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
    await landesbedienstetenSearchPage.checkSearchForm();
  });
});

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit einer Schule xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe('Funktions- und UI Testfälle zu Landesbediensteten suchen und hinzufügen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    landesbedienstetenSearchPage = new LandesbedienstetenSearchFormPage(page);
    header = new HeaderPage(page);
    searchResultErrorDialog = new SearchResultErrorDialog(page, page.getByTestId('person-search-error-dialog'));
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    schuladmin1Schule = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);

    // lehrkraft2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());
    // lehrkraftMitSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());
    // lehrkraftOhneSchulzuordnung = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());
    // lehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());
    // lockedLehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());
    // await lockPerson(page, lockedLehrkraft.personId, testschuleDstNr);
    // const vornameDoppelt: string = generateVorname();
    // const nachnameDoppelt: string = generateNachname();
    // lehrkraftDoppel1 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, vornameDoppelt, nachnameDoppelt, generateKopersNr());
    // lehrkraftDoppel2 = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, vornameDoppelt, nachnameDoppelt, generateKopersNr());
    // ersatzschulLehrkraft = await createPersonWithPersonenkontext(page, ersatzTestschuleName, ersatzschulLehrkraftRolle);
    
    landingPage = await header.logout();
    landingPage.navigateToLogin();
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin1Schule.username, schuladmin1Schule.password);
    await startPage.waitForPageLoad();
    personManagementViewPage = await startPage.goToAdministration();
    landesbedienstetenSearchPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
    await landesbedienstetenSearchPage.waitForPageLoad();
  });

  

  /*TODO: gehört nicht zum Test oben.
    await landesbedienstetenSuchenUndHinzufuegenPage.searchLandesbedienstetenViaUsername(lehrkraft2.username);
    await landesbedienstetenSuchenUndHinzufuegenPage.checkCreationFormWithOrganisation(lehrkraft2.vorname, lehrkraft2.familienname, lehrkraft2.kopersnummer, testschuleDstNrUndName); 
  */

  //SPSH-2631 Step 2   Hey Hallo Hier ;)
  //Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde: falsche Namen 
  //UI: Es wird das Popup Suchergebnis angezeigt, mit korrektem Text und Abbrechen Button
  test('Kein Treffer wegen falschen Namen: Popup wird angezeigt und ist vollständig', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
    searchResultErrorDialog = await landesbedienstetenSearchPage.clickLandesbedienstetenSuchenWithInvalidName("zzzzz", "yyyyy");
    await searchResultErrorDialog.checkPopupCompleteness();
    await expect(searchResultErrorDialog.noPersonFoundText).toHaveText('Es wurde leider kein Treffer gefunden. Bitte prüfen Sie Ihre Eingabe. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
    await expect(searchResultErrorDialog.abbrechenButton).toHaveText('Abbrechen');
  });


  //SPSH-2631 Step 3 - 5
  // Suchergebnis Popup wird angezeigt, wenn kein Treffer gefunden wurde
//   test('Kein Treffer: Popup wird angezeigt und kann geschlossen werden (KoPersNr, Email, Benutzername)', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await test.step('Suchen per KoPers.-Nr.', async () => {
//       await landesbedienstetenSearchPage.fillKopersNr("abc9999");
//       await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//       await searchResultErrorDialog.checkPopupCompleteness();
//       await searchResultErrorDialog.abbrechenButton.click();
//     });

//     await test.step('Suchen per E-Mail', async () => {
//       await landesbedienstetenSearchPage.fillEmail("nicht@existiert.de");
//       await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//       await searchResultErrorDialog.checkPopupCompleteness();
//       await searchResultErrorDialog.abbrechenButton.click();
//     });

//     await test.step('Suchen per Benutzername', async () => {
//       /* Vorname and Nachname are mandatory fields */
//       await landesbedienstetenSearchPage.checkMandatoryFieldsForNameSearch('', 'zzzzz');
//       await landesbedienstetenSearchPage.checkMandatoryFieldsForNameSearch('zzzzz', '');
//       await landesbedienstetenSearchPage.fillBenutzername("unbekannt123");
//       await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//       await searchResultErrorDialog.checkPopupCompleteness();
//       await searchResultErrorDialog.abbrechenButton.click();
//     });
//     await test.step('Suchen per Namen der Ersatzschullehrkraft', async () => {
//       await landesbedienstetenSearchPage.fillVornameNachname(ersatzschulLehrkraft.vorname, ersatzschulLehrkraft.familienname);
//       await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//       await searchResultErrorDialog.checkPopupCompleteness();
//     });
//   });

//   // Doppelter Name Fehlermeldung (!) Wir verwenden absichtlich die Namen der 2 Lehrkräfte, 
//   // damit wir keinen Eslint Fehler bekommen, weil die 2. Lehrkraft nie benutzt wird.
//   test('Doppelter Name: Fehlermeldung wird angezeigt', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await landesbedienstetenSearchPage.fillVornameNachname(lehrkraftDoppel1.vorname, lehrkraftDoppel2.familienname);
//     await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//     await searchResultErrorDialog.checkPopupCompleteness();
//     await expect(searchResultErrorDialog.noPersonFoundText).toHaveText('Es wurde mehr als ein Treffer gefunden. Bitte verwenden Sie zur Suche die KoPers.-Nr., die Landes-Mailadresse oder den Benutzernamen. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.');
//     await expect(searchResultErrorDialog.abbrechenButton).toHaveText('Abbrechen');
//   });

//   //SPSH-2632 - Suchergebnis UI Test Landesbediensteten suchen (per Namen)
//   test('Persönliche Daten und Zuordnung werden korrekt angezeigt', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await landesbedienstetenSearchPage.fillVornameNachname(lehrkraft.vorname, lehrkraft.familienname);
//     await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();

//     const lehrkraftFullName: string = `${lehrkraft.vorname} ${lehrkraft.familienname}`;
//     landesbedienstetenSearchPage.checkSearchResultCard();
//     landesbedienstetenSearchPage.checkPersonalDataCard(lehrkraftFullName, lehrkraft.username, lehrkraft.kopersnummer, lehrkraft.email);
//     // TODO: rewrite this function to iterate all zuordnungen
//     landesbedienstetenSearchPage.checkZuordnungCards(testschuleName, lehrkraftOeffentlichRolle, testschuleDstNr);
//   });

//   /* 
//     ----------------------------- Funktionale Testfälle ------------------------------
//   */
//   //SPSH-2633
//   test('Buttons zum Zurücksetzen funktionieren', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await test.step ('Button Zurück zur Suche funktioniert', async () => {
//       await landesbedienstetenSearchPage.searchByName(lehrkraft.vorname, lehrkraft.familienname);
//       await landesbedienstetenSearchPage.goBackToSearchForm(lehrkraft.vorname, lehrkraft.familienname);      
//     });
//     await test.step ('Button Zurücksetzen funktioniert', async () => {
//       await landesbedienstetenSearchPage.resetSearchForm();
//     });
//   });

//   // Gesperrte Person kann nicht gefunden werden
//   test('Gesperrte Person kann nicht gefunden werden', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await landesbedienstetenSearchPage.fillKopersNr(lockedLehrkraft.kopersnummer);
//     await landesbedienstetenSearchPage.clickLandesbedienstetenSuchen();
//     await expect(searchResultErrorDialog.headline).toBeVisible();
//   });

//   // SPSH-2660 Step 1
//   test('Landesbediensteten per KoPers suchen und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await landesbedienstetenSearchPage.fillKopersNr(lehrkraftMitSchulzuordnung.kopersnummer);
//     await landesbedienstetenSearchPage.landesbedienstetenHinzufuegenAlsLehrkraft();
//     await landesbedienstetenSearchPage.checkSuccessPage(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname, lehrkraftMitSchulzuordnung.kopersnummer, lehrkraftMitSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
//   });

//   //SPSH-2660 Step 3
//   test('Landesbediensteten ohne Schulzuordnung suchen per Benutzername und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async ({ page }: PlaywrightTestArgs) => {
//     await removeAllPersonenkontexte(page, lehrkraftOhneSchulzuordnung.personId);
//     await landesbedienstetenSearchPage.fillBenutzername(lehrkraftOhneSchulzuordnung.username);
//     await landesbedienstetenSearchPage.landesbedienstetenHinzufuegenAlsLehrkraft();
//     await landesbedienstetenSearchPage.checkSuccessPage(lehrkraftOhneSchulzuordnung.vorname, lehrkraftOhneSchulzuordnung.familienname, lehrkraftOhneSchulzuordnung.kopersnummer, lehrkraftOhneSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
//   });

//   // // SPSH-2660 Step 4
//   test('Landesbediensteten suchen per Vorname und Nachname und erfolgreich hinzufügen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await landesbedienstetenSearchPage.fillVornameNachname(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname);
//     await landesbedienstetenSearchPage.landesbedienstetenHinzufuegenAlsLehrkraft();
//     await landesbedienstetenSearchPage.checkSuccessPage(lehrkraftMitSchulzuordnung.vorname, lehrkraftMitSchulzuordnung.familienname, lehrkraftMitSchulzuordnung.kopersnummer, lehrkraftMitSchulzuordnung.username, `${testschuleDstNr} (${testschuleName})`);
//   });
// });

// /*
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit 2 Schulen xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// */

// test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit - Schuladmin 2 Schulen', () => {
//   let lehrkraft: UserInfo;
  
//   test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
//     header = new HeaderPage(page);
    
//     loginPage = await freshLoginPage(page);
//     await loginPage.login(process.env.USER, process.env.PW);

//     schuladmin2Schulen = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);
//     const testschuleID: string = await getOrganisationId(page, testschuleName);
//     const testschule665ID: string = await getOrganisationId(page, testschule665Name);
//     const schuladminRolleId: string = await getRolleId(page, schuladminOeffentlichRolle);
//     await addSecondOrganisationToPerson(page, schuladmin2Schulen.personId, testschuleID, testschule665ID, schuladminRolleId);
    
//     lehrkraft = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle, undefined, undefined, generateKopersNr());

//     landingPage = await header.logout();
//     landingPage.navigateToLogin();
    
//     const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin2Schulen.username, schuladmin2Schulen.password);
//     await startPage.waitForPageLoad();

//     personManagementViewPage = await startPage.goToAdministration();
//     landesbedienstetenSearchPage = await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
//     await landesbedienstetenSearchPage.searchLandesbedienstetenViaUsername(lehrkraft.username);
//   });
  
//   test('Seite wird vollständig angezeigt: Schuladmin mit 2 Schulen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async () => {
//     await test.step('Organisation nur aus zugewiesenen Organisationen auswählbar, UI Elemente werden angezeigt', async () => {
//       await landesbedienstetenSearchPage.checkMinimalCreationForm(lehrkraft.vorname, lehrkraft.familienname, lehrkraft.kopersnummer);
//       await landesbedienstetenSearchPage.checkSelectableOrganisationen([testschuleDstNrUndName, testschule665DstNrUndName]);
//       await landesbedienstetenSearchPage.selectOrganisation(testschule665DstNrUndName);
//       await landesbedienstetenSearchPage.selectRolleWithBefristung('LiV');
//       await landesbedienstetenSearchPage.confirmLandesbedienstetenHinzufuegen(lehrkraft.username, 'LiV');
//       await landesbedienstetenSearchPage.checkSuccessPage(lehrkraft.vorname, lehrkraft.familienname, lehrkraft.kopersnummer, lehrkraft.username, testschule665DstNrUndName);
//     });
//   });
});