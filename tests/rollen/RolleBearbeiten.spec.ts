import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { freshLoginPage } from '../../base/api/personApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { testschuleName } from '../../base/organisation';
import { generateRolleName } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

test.describe(`Testfälle für die Rollenbearbeitung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let rolleDetailsView: RolleDetailsViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Anmelden und zur Rollenbearbeitung navigieren', async () => {
      const loginPage: LoginViewPage = await freshLoginPage(page);
      const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
      await startPage.waitForPageLoad();
      const organisationId: string = await getOrganisationId(page, testschuleName);
      const rolleName: string = generateRolleName();
      await createRolle(page, RollenArt.Leit, organisationId, rolleName);
      const personManagementView: PersonManagementViewPage = await startPage.navigateToAdministration();
      const rolleManagementViewPage: RolleManagementViewPage =
        await personManagementView.menu.navigateToRolleManagement();
      await rolleManagementViewPage.setPageSize('300');
      rolleDetailsView = await rolleManagementViewPage.openGesamtuebersicht(rolleName);
    });
  });

  // SPSH-2948
  test('Rollennamen ändern', async () => {
    const newRolleName: string = generateRolleName();
    await rolleDetailsView.editRolle(newRolleName);
    await rolleDetailsView.rolleSuccessfullyEdited(newRolleName);
  });
});
