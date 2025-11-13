import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { freshLoginPage } from '../../base/api/personApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { testschuleName } from '../../base/organisation';
import { generateRolleName } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

async function setupAndGoToRolleDetailsPage(page: PlaywrightTestArgs['page']): Promise<RolleDetailsViewPage> {
  return test.step('Anmelden und zur Rollenbearbeitung navigieren', async () => {
    const loginPage: LoginViewPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    const organisationId: string = await getOrganisationId(page, testschuleName);
    const rolleName: string = generateRolleName();
    await createRolle(page, RollenArt.Leit, organisationId, rolleName);
    const personManagementView: PersonManagementViewPage = await startPage.navigateToAdministration();
    const rolleManagementViewPage: RolleManagementViewPage = await personManagementView.menu.navigateToRolleManagement();
    rolleManagementViewPage.setPageSize("300")
    return rolleManagementViewPage.openGesamtuebersicht(rolleName);
  });
}

test.describe(`Testfälle für die Rollenbearbeitung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Rollennamen ändern', async ({ page }: PlaywrightTestArgs) => {
    const rolleDetailsView: RolleDetailsViewPage = await setupAndGoToRolleDetailsPage(page);
    const newRolleName: string = generateRolleName();
    await rolleDetailsView.editRolle(newRolleName);
    await rolleDetailsView.rolleSuccessfullyEdited(newRolleName);
  });
});
