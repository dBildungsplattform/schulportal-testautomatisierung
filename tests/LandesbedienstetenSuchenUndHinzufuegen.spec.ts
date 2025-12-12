import test, { Page, PlaywrightTestArgs } from '@playwright/test';
import { freshLoginPage, lockPerson, UserInfo } from '../base/api/personApi';
import { LONG, SHORT, STAGE, DEV, BROWSER } from '../base/tags';
import {
  addSecondOrganisationToPerson,
  createPersonWithPersonenkontext,
  removeAllPersonenkontexte,
} from '../base/api/personApi';
import {
  ersatzTestschuleName,
  testschule665DstNrUndName,
  testschule665Name,
  testschuleDstNr,
  testschuleDstNrUndName,
  testschuleName,
} from '../base/organisation';
import {
  ersatzschulLehrkraftRolle,
  lehrerImVorbereitungsdienstRolle,
  lehrkraftOeffentlichRolle,
  schuladminOeffentlichRolle,
  vertretungslehrkraftRolle,
} from '../base/rollen';
import { generateKopersNr, generateNachname, generateVorname } from '../base/utils/generateTestdata';
import { LandesbedienstetenSearchFormPage } from '../pages/admin/personen/search/LandesbedienstetenSearchForm.page';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { LandingViewPage } from '../pages/LandingView.neu.page';
import { HeaderPage } from '../pages/components/Header.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.neu.page';
import { SearchResultErrorDialog } from '../pages/components/SearchResultErrorDialog';
import { getOrganisationId } from '../base/api/organisationApi';
import { getRolleId } from '../base/api/rolleApi';
import { LandesbedienstetenSearchResultPage } from '../pages/admin/personen/search/LandesbedienstetenSearchResult.page';
import { LandesbedienstetenHinzufuegenPage } from '../pages/admin/personen/search/LandesbedienstetenHinzufuegen.page';
import { LandesbedienstetenSuccessPage } from '../pages/admin/personen/search/LandesbedienstetenSucess.page';

let loginPage: LoginViewPage;
let landingPage: LandingViewPage;
let personManagementViewPage: PersonManagementViewPage;
let landesbedienstetenSearchFormPage: LandesbedienstetenSearchFormPage;
let landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage;
let landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage;
let landesbedienstetenSuccessPage: LandesbedienstetenSuccessPage;
let header: HeaderPage;
let searchResultErrorDialog: SearchResultErrorDialog;
let lehrkraftOhneSchulzuordnung: UserInfo;
let lehrkraft: UserInfo;
let lockedLehrkraft: UserInfo;
let lehrkraftDoppel1: UserInfo;
let lehrkraftDoppel2: UserInfo;
let ersatzschulLehrkraft: UserInfo;

/**
 * Expects to be landesadmin
 * @param page 
 * @param primarySchuleName 
 * @param rolle 
 * @param secondSchuleName 
 * @returns 
 */
async function setupSchuladminAndLoginAndNavigate(
  page: Page,
  primarySchuleName: string,
  rolle: string,
  secondSchuleName?: string
): Promise<LandesbedienstetenSearchFormPage> {
  const schuladmin: UserInfo = await createPersonWithPersonenkontext(page, primarySchuleName, rolle);

  if (secondSchuleName) {
    const primarySchuleId: string = await getOrganisationId(page, primarySchuleName);
    const secondSchuleId: string = await getOrganisationId(page, secondSchuleName);
    const rolleId: string = await getRolleId(page, rolle);
    await addSecondOrganisationToPerson(page, schuladmin.personId, primarySchuleId, secondSchuleId, rolleId);
  }

  header = new HeaderPage(page);
  landingPage = await header.logout();
  loginPage = await landingPage.navigateToLogin();
  const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
    schuladmin.username,
    schuladmin.password
  );
  await startPage.waitForPageLoad();
  personManagementViewPage = await startPage.goToAdministration();
  landesbedienstetenSearchFormPage =
    await personManagementViewPage.menu.navigateToLandesbedienstetenSuchenUndHinzufuegen();
  return await landesbedienstetenSearchFormPage.waitForPageLoad();
}
/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit einer Schule xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe('UI Test zu Landesbediensteten suchen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
  loginPage = await freshLoginPage(page);
  await loginPage.login(process.env.USER, process.env.PW);
    landesbedienstetenSearchFormPage = await setupSchuladminAndLoginAndNavigate(page, testschuleName, schuladminOeffentlichRolle);
  });
  //SPSH-2630
  test(
    'Landesbediensteten (suchen und hinzufügen): UI prüfen',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      await landesbedienstetenSearchFormPage.checkSearchForm();
    }
  );
});

test.describe('Funktions- und UI Testfälle zu Landesbediensteten suchen und hinzufügen', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    landesbedienstetenSearchFormPage = new LandesbedienstetenSearchFormPage(page);
    header = new HeaderPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);

    lehrkraftOhneSchulzuordnung = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      undefined,
      undefined,
      generateKopersNr()
    );
    lehrkraft = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      undefined,
      undefined,
      generateKopersNr()
    );
    lockedLehrkraft = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      undefined,
      undefined,
      generateKopersNr()
    );
    await lockPerson(page, lockedLehrkraft.personId, testschuleDstNr);
    const vornameDoppelt: string = generateVorname();
    const nachnameDoppelt: string = generateNachname();
    lehrkraftDoppel1 = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      vornameDoppelt,
      nachnameDoppelt,
      generateKopersNr()
    );
    lehrkraftDoppel2 = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      vornameDoppelt,
      nachnameDoppelt,
      generateKopersNr()
    );
    ersatzschulLehrkraft = await createPersonWithPersonenkontext(page, ersatzTestschuleName, ersatzschulLehrkraftRolle);

    landesbedienstetenSearchFormPage = await setupSchuladminAndLoginAndNavigate(page, testschuleName, schuladminOeffentlichRolle)
  });

  //SPSH-2631 Step 1
  test('Nachname ist ein Pflichtfeld', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    await landesbedienstetenSearchFormPage.checkMandatoryFieldsForNameSearch('zzzzz', '');
  });
  //SPSH-2631 Step 2
  test('Vorname ist ein Pflichtfeld', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    await landesbedienstetenSearchFormPage.checkMandatoryFieldsForNameSearch('', 'zzzzz');
  });
  //SPSH-2631 Step 3
  test(
    'Kein Treffer wegen falschen Namen: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidName(
        'zzzzz',
        'yyyyy'
      );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2631 Step 4.1
  test(
    'Abbrechen Button im Suchergebnis Dialog funktioniert',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidName(
        'zzzzz',
        'yyyyy'
      );
      landesbedienstetenSearchFormPage = await searchResultErrorDialog.clickAbbrechenButton();
      await landesbedienstetenSearchFormPage.expectNameRadioChecked();
    }
  );
  //SPSH-2631 Step 4
  test(
    'Kein Treffer wegen falscher KoPers-Nr: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidKoPers(
        'abc9999'
      );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2631 Step 5
  test(
    'Kein Treffer wegen falscher Mailadresse: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidMail(
        'test@spaß.de'
      );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2631 Step 6
  test(
    'Kein Treffer wegen falschem Benutzernamen: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog =
        await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidBenutzername('chantall789');
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2747 Step 1
  test(
    'Kein Treffer bei Ersatzschullehrkraft Suche nach Namen: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidName(
        ersatzschulLehrkraft.vorname,
        ersatzschulLehrkraft.nachname
      );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2747 Step 2
  test(
    'Kein Treffer bei gesperrten Benutzer: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog =
        await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithInvalidBenutzername(
          lockedLehrkraft.username
        );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );
  //SPSH-2747 Step 3
  /*Doppelter Name Fehlermeldung (!) Wir verwenden absichtlich die Namen der 2 Lehrkräfte, 
  damit wir keinen Eslint Fehler bekommen, weil die 2. Lehrkraft nie benutzt wird.*/
  test(
    'Mehr als ein Treffer bei doppelten Namen: Popup wird angezeigt und ist vollständig',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      searchResultErrorDialog = await landesbedienstetenSearchFormPage.clickLandesbedienstetenSuchenWithduplicateName(
        lehrkraftDoppel1.vorname,
        lehrkraftDoppel2.nachname
      );
      await searchResultErrorDialog.checkPopupCompleteness();
    }
  );

  //SPSH-2632
  test('Dev: Suchergebnis: Persönliche Daten und Zuordnung werden korrekt angezeigt', { tag: [LONG, SHORT, DEV] }, async () => {
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage =
      await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaName(lehrkraft.vorname, lehrkraft.nachname);
    await landesbedienstetenSearchResultPage.checkSearchResultCard();
    const lehrFullname: string = lehrkraft.vorname + ' ' + lehrkraft.nachname;
    await landesbedienstetenSearchResultPage.checkPersonalDataCard(
      lehrFullname,
      lehrkraft.username,
      lehrkraft.kopersnummer
    );
    await landesbedienstetenSearchResultPage.checkZuordnungCard(
      testschuleName,
      lehrkraftOeffentlichRolle,
      testschuleDstNr
    );
  });

  //SPSH-2632
  test(
    'Stage: Suchergebnis: Persönliche Daten und Zuordnung werden korrekt angezeigt',
    { tag: [STAGE] },
    async () => {
      const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage =
        await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaName(lehrkraft.vorname, lehrkraft.nachname);
      await landesbedienstetenSearchResultPage.checkSearchResultCard();
      const lehrFullname: string = lehrkraft.vorname + ' ' + lehrkraft.nachname;
      await landesbedienstetenSearchResultPage.checkPersonalDataCard(
        lehrFullname,
        lehrkraft.username,
        lehrkraft.kopersnummer,
        lehrkraft.email
      );
      await landesbedienstetenSearchResultPage.checkZuordnungCard(
        testschuleName,
        lehrkraftOeffentlichRolle,
        testschuleDstNr
      );
    }
  );

  /* 
    ----------------------------- Funktionale Testfälle ------------------------------
  */
  //SPSH-2633
  test('Button Zurücksetzen funktioniert', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    await landesbedienstetenSearchFormPage.testZuruecksetzenButtonAlleSuchtypen();
  });

  //SPSH-2633
  test('Button Zurück zur Suche funktioniert', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    interface SuchVariante {
      name: string;
      search: () => Promise<LandesbedienstetenSearchResultPage>;
      expectRadioChecked: () => Promise<void>;
      expectInputValue: () => Promise<void>;
    }

    const suchVarianten: SuchVariante[] = [
      {
        name: 'KoPers-Nr.',
        search: async () =>
          await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaKopers(lehrkraft.kopersnummer),
        expectRadioChecked: async () => await landesbedienstetenSearchFormPage.expectKopersRadioChecked(),
        expectInputValue: async () =>
          await landesbedienstetenSearchFormPage.expectKopersInputValue(lehrkraft.kopersnummer),
      },
      {
        name: 'Benutzername',
        search: async () =>
          await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaUsername(lehrkraft.username),
        expectRadioChecked: async () => await landesbedienstetenSearchFormPage.expectUsernameRadioChecked(),
        expectInputValue: async () =>
          await landesbedienstetenSearchFormPage.expectUsernameInputValue(lehrkraft.username),
      },
      {
        name: 'Name',
        search: async () =>
          await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaName(lehrkraft.vorname, lehrkraft.nachname),
        expectRadioChecked: async () => await landesbedienstetenSearchFormPage.expectNameRadioChecked(),
        expectInputValue: async () =>
          await landesbedienstetenSearchFormPage.expectNameInputValues(lehrkraft.vorname, lehrkraft.nachname),
      },
    ];
    for (const variante of suchVarianten) {
      const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage = await variante.search();
      await landesbedienstetenSearchResultPage.checkSearchResultCard();
      await landesbedienstetenSearchResultPage.clickZurueckZurSuche();
      await variante.expectRadioChecked();
      await variante.expectInputValue();
    }
  });

test('Button Zurück zur Suche funktioniert (E-Mail)', { tag: [STAGE] }, async () => {
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage =
      await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaEmail(lehrkraft.email);
    await landesbedienstetenSearchResultPage.checkSearchResultCard();
    await landesbedienstetenSearchResultPage.clickZurueckZurSuche();
    await landesbedienstetenSearchFormPage.expectEmailRadioChecked();
    await landesbedienstetenSearchFormPage.expectEmailInputValue(lehrkraft.email);
  });

  //SPSH-2634 Step 8
  test(
    'Schuladmin 1 Schule: Seite Landesbediensteten hinzufügen wird korrekt angezeigt',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      landesbedienstetenSearchResultPage = await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaKopers(
        lehrkraft.kopersnummer
      );
      landesbedienstetenHinzufuegenPage = await landesbedienstetenSearchResultPage.clickLandesbedienstetenHinzufuegen();
      await landesbedienstetenHinzufuegenPage.checkInitialFormState(
        lehrkraft.vorname,
        lehrkraft.nachname,
        lehrkraft.kopersnummer
      );
      await landesbedienstetenHinzufuegenPage.additionalCheckInitialFormState(testschuleDstNrUndName);
    }
  );

  // SPSH-2660 Step 1
  test(
    'Schuladmin 1 Schule: Landesbediensteten per KoPers suchen und erfolgreich hinzufügen',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      landesbedienstetenSearchResultPage = await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaKopers(
        lehrkraft.kopersnummer
      );
      landesbedienstetenHinzufuegenPage = await landesbedienstetenSearchResultPage.clickLandesbedienstetenHinzufuegen();
      await landesbedienstetenHinzufuegenPage.selectRolleAndConfirm(vertretungslehrkraftRolle);
      landesbedienstetenSuccessPage =
        await landesbedienstetenHinzufuegenPage.clickLandesbedienstetenHinzufügenOnConfirmationPopup();
      await landesbedienstetenSuccessPage.waitForPageLoad();
    }
  );

  //SPSH-2660 Step 3
  test(
    'Schuladmin 1 Schule: Landesbediensteten ohne Schulzuordnung suchen per Benutzername und erfolgreich hinzufügen',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      await removeAllPersonenkontexte(page, lehrkraftOhneSchulzuordnung.personId);
      landesbedienstetenSearchResultPage = await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaUsername(
        lehrkraftOhneSchulzuordnung.username
      );
      landesbedienstetenHinzufuegenPage = await landesbedienstetenSearchResultPage.clickLandesbedienstetenHinzufuegen();
      await landesbedienstetenHinzufuegenPage.selectRolleAndConfirm(lehrkraftOeffentlichRolle);
      landesbedienstetenSuccessPage =
        await landesbedienstetenHinzufuegenPage.clickLandesbedienstetenHinzufügenOnConfirmationPopup();
      await landesbedienstetenSuccessPage.waitForPageLoad();
    }
  );

  // // SPSH-2660 Step 4
  test(
    'Schuladmin 1 Schule: Landesbediensteten suchen per Vorname und Nachname und erfolgreich hinzufügen',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async () => {
      landesbedienstetenSearchResultPage = await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaName(
        lehrkraft.vorname,
        lehrkraft.nachname
      );
      landesbedienstetenHinzufuegenPage = await landesbedienstetenSearchResultPage.clickLandesbedienstetenHinzufuegen();
      await landesbedienstetenHinzufuegenPage.selectRolleAndConfirm(vertretungslehrkraftRolle);
      landesbedienstetenSuccessPage =
        await landesbedienstetenHinzufuegenPage.clickLandesbedienstetenHinzufügenOnConfirmationPopup();
      await landesbedienstetenSuccessPage.waitForPageLoad();
    }
  );
});

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin mit 2 Schulen xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/

test.describe('Testfälle für Landesbediensteten hinzufügen, Funktion und UI-Vollständigkeit - Schuladmin 2 Schulen', () => {
  let lehrkraft: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);

    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);
    
    lehrkraft = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      undefined,
      undefined,
      generateKopersNr()
    );

    landesbedienstetenSearchFormPage = await setupSchuladminAndLoginAndNavigate(page, testschuleName, schuladminOeffentlichRolle, testschule665Name);
    landesbedienstetenSearchResultPage = await landesbedienstetenSearchFormPage.searchLandesbedienstetenViaUsername(
      lehrkraft.username
    );
    landesbedienstetenHinzufuegenPage = await landesbedienstetenSearchResultPage.clickLandesbedienstetenHinzufuegen();
  });

  //SPSH-2634 Step 1
  test('UI: Schuladmin 2 Schulen: initialer Formularstatus', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    await landesbedienstetenHinzufuegenPage.checkInitialFormState(
      lehrkraft.vorname,
      lehrkraft.nachname,
      lehrkraft.kopersnummer
    );
  });

  //SPSH-2634 Step 2
  test('Schuladmin 2 Schulen: Organisationsauswahl eingeschränkt', { tag: [LONG, SHORT, STAGE, DEV] }, async () => {
    const erwarteteOrganisationen: string[] = [testschuleDstNrUndName, testschule665DstNrUndName];
    await landesbedienstetenHinzufuegenPage.assertAllMenuItemsForOrganisation(erwarteteOrganisationen);
  });
  //SPSH-2634 Step 3
  test(
    'Schuladmin 2 Schulen: Rollenfelder werden nach Organisationsauswahl angezeigt',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      await landesbedienstetenHinzufuegenPage.selectOrganisation(testschule665DstNrUndName);
    }
  );

  //SPSH-2634 Step 4
  test(
    'Schuladmin 2 Schulen: Bei Auswahl Rolle LiV wird Befristung angezeigt',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      await landesbedienstetenHinzufuegenPage.selectOrganisation(testschule665DstNrUndName);
      await landesbedienstetenHinzufuegenPage.selectRolle(lehrerImVorbereitungsdienstRolle);
      await landesbedienstetenHinzufuegenPage.checkIfBefristungIsEnforced();
    }
  );
  //SPSH-2634 Step 5
  test(
    'Schuladmin 2 Schulen: Bestätigungs-Popup wird angezeigt mit korrektem Text',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      await landesbedienstetenHinzufuegenPage.addLandesbedienstetenWithOrgaAndRolle(
        testschule665DstNrUndName,
        lehrkraftOeffentlichRolle
      );
      await landesbedienstetenHinzufuegenPage.verifyAddEmployeePopupIsShown(
        lehrkraftOeffentlichRolle,
        lehrkraft.username
      );
    }
  );

  //SPSH-2634 Step 6
  test(
    'Schuladmin 2 Schulen: Bestätigungspopup schließt nach klick auf Abbrechen',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      await landesbedienstetenHinzufuegenPage.addLandesbedienstetenWithOrgaAndRolle(
        testschule665DstNrUndName,
        lehrkraftOeffentlichRolle
      );
      await landesbedienstetenHinzufuegenPage.clickAbbrechenOnConfirmationPopup();
    }
  );

  //SPSH-2634 Step 7
  test(
    'Schuladmin 2 Schulen: UI: Bestätigungseite wird komplett angezeigt.',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async () => {
      await landesbedienstetenHinzufuegenPage.addLandesbedienstetenWithOrgaAndRolle(
        testschule665DstNrUndName,
        lehrkraftOeffentlichRolle
      );
      landesbedienstetenSuccessPage =
        await landesbedienstetenHinzufuegenPage.clickLandesbedienstetenHinzufügenOnConfirmationPopup();
      const lehrFullname: string = lehrkraft.vorname + ' ' + lehrkraft.nachname;
      await landesbedienstetenSuccessPage.assertAllElementsVisible(lehrFullname);
    }
  );
});
