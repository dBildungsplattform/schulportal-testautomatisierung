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
import { LONG, SHORT, STAGE } from "../base/tags";


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
    await expect(landesbedienstetenHinzufuegenPage.closeButtonX).toBeVisible();
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
  //SPSH-2634 Step 1
  test.only('Schuladmin 2 Schulen', { tag: [LONG, SHORT, STAGE] }, async () => {
    await test.step('Organisation nur aus zugewiesenen Organisationen auswählbar, UI Elemente werden angezeigt', async () => {
      await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenHinzufuegenPage.pflichtfelderHinweisText).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
      await expect(landesbedienstetenHinzufuegenPage.closeButtonX).toBeVisible();
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
      await landesbedienstetenHinzufuegenPage.organisationOeffnenButton.click();
      const optionTexts: string[] = await landesbedienstetenHinzufuegenPage.organisationAutocomplete.allTextContents();
      const erwarteteOrganisationen: string[] = [testschuleDstNrUndName, testschule665DstNrUndName];
      expect(optionTexts).toEqual(expect.arrayContaining(erwarteteOrganisationen));
    });
    //SPSH-2634 Step 2
    await test.step('Nach Organisationsauswahl werden Rollenfelder angezeigt, Auswahl 2. Organisation im Dropdown', async () => {
      // Auswahl der zweiten Organisation
      await landesbedienstetenHinzufuegenPage.organisationAutocomplete.selectByName(testschule665DstNrUndName);
      await expect(landesbedienstetenHinzufuegenPage.rolleHeadline).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.rollenSelect).toBeVisible();
    });
    //SPSH-2634 Step 3
    await test.step('Befristung wird angezeigt bei Auswahl LiV', async () => {
      await landesbedienstetenHinzufuegenPage.rolleOeffnenButton.click();
      await landesbedienstetenHinzufuegenPage.rolleAutocomplete.selectByTitle('LiV');
      await expect(landesbedienstetenHinzufuegenPage.befristungHeadline).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.befristungInput).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.bisSchuljahresendeRadio).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.unbefristetRadio).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.bisSchuljahresendeRadio).toBeChecked();
      await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeEnabled();
    });
    //SPSH-2634 Step 4
    await test.step('Bestätigungs-Popup wird angezeigt mit korrektem Text', async () => {
      await landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
      await landesbedienstetenHinzufuegenPage.checkForBestaetigungspopupCompleteness();
      const confirmationText: string = await landesbedienstetenHinzufuegenPage.nachfragetextImBestaetigungsPopup.textContent();
      expect(confirmationText).toContain(`Wollen Sie ${lehrkraft2.username} als LiV hinzufügen?`);
    });
    //SPSH-2634 Step 5
    await test.step('Abbrechen im Bestätigungs-Popup funktioniert', async () => {
      await landesbedienstetenHinzufuegenPage.abbrechenButtonImBestaetigungsPopup.click();
      await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton).toBeEnabled();
    });
    //SPSH-2634 Step 6
    await test.step('Nach Bestätigung auf Popup wird die Card Landesbediensteten hinzufügen vollständig angezeigt', async () =>{
      await landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButton.click();
      await landesbedienstetenHinzufuegenPage.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup.click();
      
      await expect(landesbedienstetenHinzufuegenPage.headline).toHaveText('Landesbediensteten hinzufügen');
      await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.erfolgsText).toHaveText(`${lehrkraft2.vorname} ${lehrkraft2.familienname} wurde erfolgreich hinzugefügt.`);
      await expect(landesbedienstetenHinzufuegenPage.card.locator('.subtitle-2')).toHaveText('Folgende Daten wurden gespeichert:');
      await expect(landesbedienstetenHinzufuegenPage.zurGesamtuebersichtButton).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.zurGesamtuebersichtButton).toHaveText('Zur Gesamtübersicht');
      await expect(landesbedienstetenHinzufuegenPage.zurueckZurErgebnislisteButton).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.zurueckZurErgebnislisteButton).toHaveText('Zurück zur Ergebnisliste');
      await expect(landesbedienstetenHinzufuegenPage.weiterenLandesbedienstetenSuchenButton).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.weiterenLandesbedienstetenSuchenButton).toHaveText('Weiteren Landesbediensteten suchen');

      // Label zu Feldern auf der Card prüfen
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Vorname:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Nachname:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('KoPers.-Nr.:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Benutzername:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Organisationsebene:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Rolle:', { exact: true })).toBeVisible();
      await expect(landesbedienstetenHinzufuegenPage.card.getByText('Befristung:', { exact: true })).toBeVisible();
      //Wert bei Befristung wird angezeigt, es wird nicht auf korrektem Datum geprüft
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-befristung')).toBeVisible();
      // Werte zu Feldern auf der Card prüfen
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-vorname')).toHaveText(lehrkraft2.vorname);
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-familienname')).toHaveText(lehrkraft2.familienname);
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-personalnummer')).toHaveText(lehrkraft2.kopersnummer);
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-username')).toHaveText(lehrkraft2.username);
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-organisation')).toHaveText(testschule665DstNrUndName);
      await expect(landesbedienstetenHinzufuegenPage.card.getByTestId('added-landesbediensteter-rolle')).toHaveText('LiV');
    });
  });
});
