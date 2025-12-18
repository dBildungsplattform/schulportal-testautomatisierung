import { PlaywrightTestArgs, test } from '@playwright/test';

import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { HeaderPage } from '../../pages/components/Header.neu.page';

let header: HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let benutzerErgebnislistePage: PersonManagementViewPage;
let admin: UserInfo;

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für die Ergebnisliste von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      loginPage = await freshLoginPage(page);
      await loginPage.login(process.env.USER, process.env.PW);

      admin = await createPersonWithPersonenkontext(page, organisationsName, rolleName, undefined, undefined, generateDienststellenNr());

      landingPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Benutzern
      benutzerErgebnislistePage = await startPage.goToAdministration();  
    });

    // SPSH-2923
    test(`Als ${bezeichnung}: Benutzer Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] },  async () => {
      await benutzerErgebnislistePage.checkManagementPage();
    });

    // SPSH-2925
    test(`Als ${bezeichnung}: In der Ergebnisliste die Suchfunktion benutzen`, { tag: [STAGE, DEV] },  async () => {
      // Suche nach Nachnamen
      await benutzerErgebnislistePage.searchByText(admin.nachname);
      await benutzerErgebnislistePage.checkIfPersonExists(admin.nachname);

      // Suche nach Vornamen
      await benutzerErgebnislistePage.searchByText(admin.vorname);
      await benutzerErgebnislistePage.checkIfPersonExists(admin.vorname);

      // Suche nach Benutzername
      await benutzerErgebnislistePage.searchByText(admin.username);
      await benutzerErgebnislistePage.checkIfPersonExists(admin.username);

      // Suche nach Kopers
      await benutzerErgebnislistePage.searchByText(admin.kopersnummer);
      await benutzerErgebnislistePage.checkIfPersonExists(admin.kopersnummer);

      // Suche nach Rolle
      await benutzerErgebnislistePage.searchByText(rolleName);
      await benutzerErgebnislistePage.checkIfPersonExists(rolleName);

      // Suche nach einem nicht existierenden Eintrag
      await benutzerErgebnislistePage.searchByText('NichtExistierenderEintrag');
      await benutzerErgebnislistePage.checkIfPersonExists('Keine Daten gefunden.');
      await benutzerErgebnislistePage.checkRowCount(0);
    });

    // SPSH-2926
    test(`Als ${bezeichnung}: In der Ergebnisliste die Filterfunktion der Schulen benutzen`, { tag: [STAGE, DEV] },  async () => {
      // Filtern nach Schule
      if (rolleName === landesadminRolle) {
        await benutzerErgebnislistePage.filterBySchule(organisationsName);
        await benutzerErgebnislistePage.checkIfPersonExists(admin.username);
        await benutzerErgebnislistePage.resetFilter();
      } else {
        await benutzerErgebnislistePage.checkIfSchuleIsCorrect(testschuleDstNr, testschuleName);
      }
    });
  });
});