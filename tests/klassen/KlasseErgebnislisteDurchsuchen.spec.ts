import { PlaywrightTestArgs, test } from '@playwright/test';
import { DEV, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { landSH } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { getRolleId } from '../../base/api/rolleApi';
import { generateKlassenname, generateDienststellenNr, generateSchulname } from '../../base/utils/generateTestdata';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (1 Schule)' },
  { rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (2 Schulen)' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName?: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für die Ergebnisliste von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    
    const hasMultipleSchulen: boolean = bezeichnung !== 'Schuladmin (1 Schule)';
    let klasseManagementViewPage: KlasseManagementViewPage;
    let personManagementViewPage: PersonManagementViewPage;
    let schuleParams: SchuleCreationParams;
    let schuleId: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      personManagementViewPage = await loginAndNavigateToAdministration(page);

      // Schule anlegen
      let schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schuleParams = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      let schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
      await schuleSuccessPage.waitForPageLoad();
      schuleId = await getOrganisationId(page, schuleParams.name);

      const adminOrganisation: string = organisationsName || schuleParams.name;
      const admin: UserInfo = await createPersonWithPersonenkontext(page, adminOrganisation, rolleName);

      // Bei Schuladmin mit 2 Schulen: zweite Schule anlegen
      if (hasMultipleSchulen) {
        const zweiteSchule: SchuleCreationParams = {
          name: generateSchulname(),
          dienststellenNr: generateDienststellenNr(),
          schulform: Schulform.Oeffentlich
        };
        schuleCreationViewPage = await schuleSuccessPage.goBackToCreateAnotherSchule();
        schuleSuccessPage = await schuleCreationViewPage.createSchule(zweiteSchule);
        await schuleSuccessPage.waitForPageLoad();
        const zweiteSchuleId: string = await getOrganisationId(page, zweiteSchule.name);

        const rolleId: string = await getRolleId(page, rolleName);
        await addSecondOrganisationToPerson(page, admin.personId, schuleId, zweiteSchuleId, rolleId);
      }

      const landingPage: LandingViewPage = await header.logout();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();

      // Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      // Navigation zur Klassenliste
      personManagementViewPage = await startPage.navigateToAdministration();
      klasseManagementViewPage = await personManagementViewPage.menu.navigateToKlasseManagement();
    });

    test.describe('UI Tests ohne Datenanlage', () => {
      // SPSH-2853
      test(`Als ${bezeichnung}: Klasse Ergebnisliste: UI prüfen`, { tag: [DEV, STAGE] }, async () => {
        await klasseManagementViewPage.checkManagementPage(hasMultipleSchulen);
      });
    });

    test.describe('Mit Klassendatenanlage', () => {
      let generierteKlassenNamen: string[] = [];

      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        // 40 Klassen anlegen
        generierteKlassenNamen = await Promise.all(
          Array.from({length: 40}, async () => {
            const klassenname: string = generateKlassenname();
            await createKlasse(page, schuleId, klassenname);
            return klassenname;
          })
        );
      });

      // SPSH-2855
      test(`Als ${bezeichnung}: Jede Klasse hat eine Dienststellennummer neben dem Klassennamen`, { tag: [DEV, STAGE] }, async () => {
        await klasseManagementViewPage.setItemsPerPage(50);
        await klasseManagementViewPage.checkTableData(hasMultipleSchulen);
      });

      test(`Als ${bezeichnung}: Ergebnisliste Klassen nach Spalte Klasse sortieren können`, { tag: [DEV, STAGE] }, async () => {
        await test.step(`Schule filtern oder validieren`, async () => {
          await klasseManagementViewPage.setItemsPerPage(5);
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.filterBySchule(schuleParams.name);
            await klasseManagementViewPage.waitForDataLoad();
          } else {
            await klasseManagementViewPage.checkIfSchuleIsCorrect(schuleParams.name, schuleParams.dienststellenNr);
          }
        });

        await test.step(`Sortierverhalten prüfen`, async () => {
          await klasseManagementViewPage.checkIfColumnDataSorted(hasMultipleSchulen, 'ascending');

          await klasseManagementViewPage.toggleKlasseSort();
          await klasseManagementViewPage.checkIfColumnDataSorted(hasMultipleSchulen, 'descending');

          await klasseManagementViewPage.toggleKlasseSort();
          await klasseManagementViewPage.checkIfColumnDataSorted(hasMultipleSchulen, 'ascending');

          if (hasMultipleSchulen) {
            await klasseManagementViewPage.checkIfColumnHeaderSorted('Dienststellennummer', 'not-sortable');
          }
        });
      });

      test(`Als ${bezeichnung}: in der Ergebnisliste die Filter benutzen`, { tag: [DEV, STAGE] }, async () => {
        const testKlasse: string = generierteKlassenNamen[0];

        await test.step(`In der Ergebnisliste eine Klasse durch Filter suchen`, async () => {
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.filterBySchule(schuleParams.name);
          } else {
            await klasseManagementViewPage.checkIfSchuleIsCorrect(schuleParams.name, schuleParams.dienststellenNr);
          }
          await klasseManagementViewPage.filterByKlasse(testKlasse);
          await klasseManagementViewPage.waitForDataLoad();
          await klasseManagementViewPage.checkIfKlasseExists(testKlasse);
          await klasseManagementViewPage.checkRows(1);
        });
      });
    });
  });
});