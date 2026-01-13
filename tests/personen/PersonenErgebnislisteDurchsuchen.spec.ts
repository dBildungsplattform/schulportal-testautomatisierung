import { PlaywrightTestArgs, test } from '@playwright/test';
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr, generateSchulname, generateKlassenname } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';

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
  test.describe(`Testfälle für die Ergebnisliste von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    let header: HeaderPage;
    let loginPage: LoginViewPage;
    let personManagementViewPage: PersonManagementViewPage;
    let schuleParams: SchuleCreationParams;
    let schuleId: string;
    let admin: UserInfo;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      loginPage = await freshLoginPage(page);
      let startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
      await startPage.waitForPageLoad();

      // Schule anlegen
      personManagementViewPage = await startPage.goToAdministration();  
      const schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schuleParams = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      const schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
      await schuleSuccessPage.waitForPageLoad();
      schuleId = await getOrganisationId(page, schuleParams.name);

      // Admin anlegen
      admin = await createPersonWithPersonenkontext(page, rolleName === landesadminRolle ? landSH : schuleParams.name, rolleName, undefined, undefined, generateDienststellenNr());

      const landingPage: LandingViewPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      startPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Benutzern
      personManagementViewPage = await startPage.goToAdministration();  
    });

    // SPSH-2923
    test(`Als ${bezeichnung}: Benutzer Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] },  async () => {
      await personManagementViewPage.checkManagementPage();
    });

    // SPSH-2925
    test(`Als ${bezeichnung}: In der Ergebnisliste die Suchfunktion benutzen`, { tag: [STAGE, DEV] },  async () => {
      // Suche nach Nachnamen
      await personManagementViewPage.searchByText(admin.nachname);
      await personManagementViewPage.checkIfPersonExists(admin.nachname);

      // Suche nach Vornamen
      await personManagementViewPage.searchByText(admin.vorname);
      await personManagementViewPage.checkIfPersonExists(admin.vorname);

      // Suche nach Benutzername
      await personManagementViewPage.searchByText(admin.username);
      await personManagementViewPage.checkIfPersonExists(admin.username);

      // Suche nach Kopers
      await personManagementViewPage.searchByText(admin.kopersnummer);
      await personManagementViewPage.checkIfPersonExists(admin.kopersnummer);

      // Suche nach Rolle
      await personManagementViewPage.searchByText(rolleName);
      await personManagementViewPage.checkIfPersonExists(rolleName);

      // Suche nach einem nicht existierenden Eintrag
      await personManagementViewPage.searchByText('NichtExistierenderEintrag');
      await personManagementViewPage.checkIfPersonExists('Keine Daten gefunden.');
      await personManagementViewPage.checkRowCount(0);
    });

    // SPSH-2926
    test(`Als ${bezeichnung}: In der Ergebnisliste die Filterfunktion der Schulen benutzen`, { tag: [STAGE, DEV] },  async () => {
      // Filtern nach Schule
      if (rolleName === landesadminRolle) {
        await personManagementViewPage.filterBySchule(landSH);
        await personManagementViewPage.checkIfPersonExists(admin.username);
        await personManagementViewPage.resetFilter();
      } else {
        await personManagementViewPage.checkIfSchuleIsCorrect(schuleParams.dienststellenNr, schuleParams.name);
      }
    });

    test.describe('Klassenfilter-Tests', () => {
      let klassenNamen: string[] = [];

      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        // 40 Klassen für die Schule anlegen
        klassenNamen = [];
        for (let i: number = 0; i < 40; i++) {
          const klassenname: string = generateKlassenname();
          await createKlasse(page, schuleId, klassenname);
          klassenNamen.push(klassenname);
        }
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anzeigen`, { tag: [STAGE, DEV] }, async () => {
        // Für Landesadmin: erst nach Schule filtern
        if (rolleName === landesadminRolle) {
          await personManagementViewPage.filterBySchule(schuleParams.name);
        }
        await personManagementViewPage.checkAllDropdownOptionsVisible(klassenNamen);
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anklickbar`, { tag: [STAGE, DEV] }, async () => {
        // Für Landesadmin: erst nach Schule filtern
        if (rolleName === landesadminRolle) {
          await personManagementViewPage.filterBySchule(schuleParams.name);
        }
        await personManagementViewPage.checkAllDropdownOptionsClickable(klassenNamen);
      });

      // SPSH-2923
      test(`Als ${bezeichnung}: Benutzer Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] }, async () => {
              const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
        await startPage.waitForPageLoad();

        // Navigation zur Ergebnisliste von Benutzern
        personManagementViewPage = await startPage.goToAdministration();
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
        // Filtern nach Schule
        if (rolleName === landesadminRolle) {
          await personManagementViewPage.filterBySchule(organisationsName);
        }
        await personManagementViewPage.checkIfSchuleIsCorrect(organisationsName, dienststellenNr);
      }
    );
  });
});
});