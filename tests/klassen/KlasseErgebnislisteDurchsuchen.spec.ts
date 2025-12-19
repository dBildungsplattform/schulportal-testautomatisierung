import { PlaywrightTestArgs, test } from '@playwright/test';
import { DEV, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { landSH, testschule665Name, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { getOrganisationId } from '../../base/api/organisationApi';
import { getRolleId } from '../../base/api/rolleApi';
import { generateKlassenname } from '../../base/utils/generateTestdata';

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (1 Schule)' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (2 Schulen)' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für die Ergebnisliste von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    const hasMultipleSchulen: boolean = bezeichnung !== 'Schuladmin (1 Schule)';
    let klasseManagementViewPage: KlasseManagementViewPage;
    let personManagementViewPage: PersonManagementViewPage;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const loginPage: LoginViewPage = await freshLoginPage(page);
      await loginPage.login(process.env.USER, process.env.PW);

      const admin: UserInfo = await createPersonWithPersonenkontext(page, organisationsName, rolleName);

      if (bezeichnung === 'Schuladmin (2 Schulen)') {
        const ersteSchuleId: string = await getOrganisationId(page, testschuleName);
        const zweiteSchuleId: string = await getOrganisationId(page, testschule665Name);
        const rolleId: string = await getRolleId(page, rolleName);
        await addSecondOrganisationToPerson(page, admin.personId, ersteSchuleId, zweiteSchuleId, rolleId);
      }

      const landingPage: LandingViewPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Klassen
      personManagementViewPage = await startPage.goToAdministration(); 
      klasseManagementViewPage = await personManagementViewPage.menu.navigateToKlasseManagement();  
    });

    test.describe('UI Tests ohne Datenanlage', () => {
      // SPSH-2853
      test(`Als ${bezeichnung}: Klasse Ergebnisliste: UI prüfen`, { tag: [DEV, STAGE] },  async () => {
        await klasseManagementViewPage.checkManagementPage(hasMultipleSchulen);
      });

      // SPSH-2855
      test(`Als ${bezeichnung}: Jede Klasse hat eine Dienststellennummer neben dem Klassennamen`, { tag: [DEV, STAGE] },  async () => {
        // erste 50 Einträge 
        await klasseManagementViewPage.setItemsPerPage(50);
        await klasseManagementViewPage.checkTableData(hasMultipleSchulen);
      });

      test(`Als ${bezeichnung}: Ergebnisliste Klassen nach Spalte Klasse sortieren können`, { tag: [DEV, STAGE] },  async () => {
        await test.step(`Sortierverhalten ohne Filter prüfen`, async () => {
          await klasseManagementViewPage.setItemsPerPage(100);
          await klasseManagementViewPage.checkIfColumnDataSorted(hasMultipleSchulen);
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.checkIfColumnHeaderSorted('Dienststellennummer', 'not-sortable');
          }
        });

        await test.step(`Sortierverhalten mit Schulfilter prüfen`, async () => {
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.filterBySchule(testschuleName);
          } else {
            await klasseManagementViewPage.checkIfSchuleIsCorrect(testschuleName, testschuleDstNr);
          }
          
          await klasseManagementViewPage.checkIfColumnDataSorted(hasMultipleSchulen);
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.checkIfColumnHeaderSorted('Dienststellennummer', 'not-sortable');
          }
        });
      });
    });

    test.describe('Mit Klassendatenanlage', () => {
      let klasseParams: KlasseCreationParams;

      test.beforeEach(() => {
        // Testdaten vorbereiten
        klasseParams = {
          schulname: testschuleName,
          klassenname: generateKlassenname(),
          schulNr: testschuleDstNr
        };
      });

      test(`Als ${bezeichnung}: in der Ergebnisliste die Filter benutzen`, { tag: [DEV, STAGE] },  async () => {
        await test.step(`Klasse anlegen`, async () => {
          const klasseCreationViewPage: KlasseCreationViewPage = await personManagementViewPage.menu.navigateToKlasseCreation();
          const klasseCreationSuccessPage: KlasseCreationSuccessPage = await klasseCreationViewPage.createKlasse(hasMultipleSchulen, klasseParams);
          await klasseCreationSuccessPage.waitForPageLoad();
          klasseManagementViewPage = await klasseCreationSuccessPage.goBackToList();
        });

        await test.step(`In der Ergebnisliste die neue Klasse durch Filter suchen`, async () => {
          await klasseManagementViewPage.waitForPageLoad();
          if (hasMultipleSchulen) {
            await klasseManagementViewPage.filterBySchule(klasseParams.schulname);
          } else {
            await klasseManagementViewPage.checkIfSchuleIsCorrect(klasseParams.schulname, klasseParams.schulNr);
          }
          await klasseManagementViewPage.filterByKlasse(klasseParams.klassenname);
          await klasseManagementViewPage.checkIfKlasseExists(klasseParams.klassenname);
          await klasseManagementViewPage.checkRows(1);
        });
      });
    });
  });
});