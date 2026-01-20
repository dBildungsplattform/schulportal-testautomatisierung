import { PlaywrightTestArgs, test } from '@playwright/test';

import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { getRolleId } from '../../base/api/rolleApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateDienststellenNr, generateKlassenname, generateSchulname } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';

let header: HeaderPage;
let landingPage: LandingViewPage;
let personManagementViewPage: PersonManagementViewPage;
let admin: UserInfo;

interface AdminFixture {
  organisationsName: string;
  dienststellenNr?: string;
  rolleName: string;
  bezeichnung: string;
}

[
  { organisationsName: landSH, dienststellenNr: undefined, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  {
    organisationsName: testschuleName,
    dienststellenNr: testschuleDstNr,
    rolleName: schuladminOeffentlichRolle,
    bezeichnung: 'Schuladmin',
  },
].forEach(({ organisationsName, dienststellenNr, rolleName, bezeichnung }: AdminFixture) => {
  let schuleId2: string;
  let schuleParams: SchuleCreationParams;
  test.describe(`Testfälle für die Ergebnisliste von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      personManagementViewPage = await loginAndNavigateToAdministration(page);

      admin = await createPersonWithPersonenkontext(
        page,
        organisationsName,
        rolleName,
        undefined,
        undefined,
        generateDienststellenNr()
      );

      const schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schuleParams = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      const schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
      await schuleSuccessPage.waitForPageLoad();
      const schuleId1: string = await getOrganisationId(page, organisationsName);
      schuleId2 = await getOrganisationId(page, schuleParams.name);
      const rolleId: string = await getRolleId(page, rolleName);
      if(rolleName === schuladminOeffentlichRolle){
        await addSecondOrganisationToPerson(page, admin.personId, schuleId1, schuleId2, rolleId);
      }
      landingPage = await header.logout();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Benutzern
      personManagementViewPage = await startPage.navigateToAdministration();  
    });

    // SPSH-2923
    test(`Als ${bezeichnung}: Benutzer Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] }, async () => {
      await personManagementViewPage.checkManagementPage();
    });

    // SPSH-2925
    test.describe(
      `Als ${bezeichnung}: In der Ergebnisliste die Suchfunktion benutzen`,
      { tag: [STAGE, DEV] },
      async () => {
        for (const [key, getValue] of [
          ['Nachname', (): string => admin.nachname],
          ['Vorname', (): string => admin.vorname],
          ['Benutzername', (): string => admin.username],
          ['Kopersnummer', (): string => admin.kopersnummer],
        ] as [string, () => string][]) {
          test(`Suche nach ${key}`, async () => {
            const value: string = getValue();
            await personManagementViewPage.searchByText(value);
            await personManagementViewPage.checkIfPersonExists(value);
          });
        }

        // searching for rolle in search-field makes no sense
        test(`Suche nach Rolle`, async () => {
          await personManagementViewPage.filterByRolle(rolleName);
          await personManagementViewPage.checkIfRolleIsCorrect(rolleName);
        });

        test(`Suche nach einem nicht existierenden Eintrag`, async () => {
          await personManagementViewPage.searchByText('NichtExistierenderEintrag');
          await personManagementViewPage.checkIfPersonExists('Keine Daten gefunden.');
          await personManagementViewPage.checkRowCount(0);
        });
      }
    );

    // SPSH-2926
    test(
      `Als ${bezeichnung}: In der Ergebnisliste die Filterfunktion der Schulen benutzen`,
      { tag: [STAGE, DEV] },
      async () => {
        if(rolleName === schuladminOeffentlichRolle){
        await personManagementViewPage.filterBySchule(organisationsName, false);
        } else {
          // The searchstring for land matches multiple organisations, so we need to use exactMatch=true
        await personManagementViewPage.filterBySchule(organisationsName, true);
        }
        await personManagementViewPage.checkIfSchuleIsCorrect(organisationsName, dienststellenNr);
      }
    );

    // SPSH-3056
    test.describe('Klassenfilter-Tests', () => {
      let klassenNamen: string[] = [];

      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        // 40 Klassen für die Schule anlegen
        klassenNamen = [];
        for (let i: number = 0; i < 40; i++) {
          const klassenname: string = generateKlassenname();
          await createKlasse(page, schuleId2, klassenname);
          klassenNamen.push(klassenname);
        }
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anzeigen`, { tag: [STAGE, DEV] }, async () => {
        await personManagementViewPage.filterBySchule(schuleParams.name);
        await personManagementViewPage.checkAllDropdownOptionsVisible(klassenNamen);
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anklickbar`, { tag: [STAGE, DEV] }, async () => {
        await personManagementViewPage.filterBySchule(schuleParams.name);
        await personManagementViewPage.checkAllDropdownOptionsClickable(klassenNamen);
      });
    });
  });
});
