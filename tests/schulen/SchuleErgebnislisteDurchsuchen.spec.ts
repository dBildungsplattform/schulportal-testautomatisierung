import { PlaywrightTestArgs, test } from '@playwright/test';
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle } from '../../base/rollen'
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { SchuleManagementViewPage } from '../../pages/admin/organisationen/schulen/SchuleManagementView.neu.page';

let header: HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let schuleManagementViewPage: SchuleManagementViewPage;
let landesadmin: UserInfo;

test.describe(`Testfälle für die Ergebnisliste von Schulen als Landesadmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);

    landesadmin = await createPersonWithPersonenkontext(page, landSH, landesadminRolle);

    landingPage = await header.logout();
    landingPage.navigateToLogin();

    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(landesadmin.username, landesadmin.password)
    await startPage.waitForPageLoad();

    // Navigation zur Ergebnisliste von Schulen
    personManagementViewPage = await startPage.goToAdministration();  
    schuleManagementViewPage = await personManagementViewPage.menu.navigateToSchuleManagement();
  });

  // SPSH-2953
  test(`Schulen Ergebnisliste: UI prüfen`, { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await schuleManagementViewPage.checkManagementPage();
  });

  test(`In der Ergebnisliste die Suchfunktion benutzen`, { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    // Auf 5 Einträge pro Seite setzen, damit Testschule nicht direkt sichtbar ist
    await schuleManagementViewPage.setPageSize('5');

    // Suche nach Schulname
    await schuleManagementViewPage.searchByText(testschuleName);
    await schuleManagementViewPage.checkIfSchuleExists(testschuleName);
    await schuleManagementViewPage.checkRowCount(1);

    // Suche nach Dienststellennummer
    await schuleManagementViewPage.searchByText(testschuleDstNr);
    await schuleManagementViewPage.checkIfSchuleExists(testschuleDstNr);
    await schuleManagementViewPage.checkRowCount(1);
  });
});