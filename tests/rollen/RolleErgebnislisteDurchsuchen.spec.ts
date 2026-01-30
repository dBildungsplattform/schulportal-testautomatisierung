import { PlaywrightTestArgs, test } from '@playwright/test';

import { createPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { landSH } from '../../base/organisation';
import { landesadminRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';

let header: HeaderPage;
let rolleManagementViewPage: RolleManagementViewPage;
let landesadmin: UserInfo;

test.describe(`Testfälle für die Ergebnisliste von Rollen als Landesadmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    await loginAndNavigateToAdministration(page);

    landesadmin = await createPersonWithPersonenkontext(page, landSH, landesadminRolle);

    const landingPage: LandingViewPage = await header.logout();
    const loginPage: LoginViewPage = await landingPage.navigateToLogin();

    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
      landesadmin.username,
      landesadmin.password
    );
    await startPage.waitForPageLoad();

    // Navigation zur Ergebnisliste von Rollen
    const personManagementViewPage: PersonManagementViewPage = await startPage.navigateToAdministration();
    rolleManagementViewPage = await personManagementViewPage.menu.navigateToRolleManagement();
  });

  test(`Als Landesadmin: Rolle Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] }, async () => {
    await rolleManagementViewPage.checkManagementPage();
  });
});
