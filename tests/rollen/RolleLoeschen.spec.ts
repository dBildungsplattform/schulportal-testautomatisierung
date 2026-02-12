import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPersonWithPersonenkontext, freshLoginPage } from '../../base/api/personApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { testschuleName } from '../../base/organisation';
import { generateRolleName } from '../../base/utils/generateTestdata';
import { Alert } from '../../pages/components/Alert';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';

test.describe(`Testfälle für die Rollenlöschung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let rolleDetailsView: RolleDetailsViewPage;
  let rolleName: string;
  let personManagementView: PersonManagementViewPage;
  let rolleManagementViewPage: RolleManagementViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    const loginPage: LoginViewPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
    await startPage.waitForPageLoad();
    const organisationId: string = await getOrganisationId(page, testschuleName);


    rolleName = generateRolleName();
    await createRolle(page, RollenArt.Leit, organisationId, rolleName);
    personManagementView = await startPage.goToAdministration();
    rolleManagementViewPage = await personManagementView.menu.navigateToRolleManagement();
    await rolleManagementViewPage.setPageSize('300');
    rolleDetailsView = await rolleManagementViewPage.openGesamtuebersicht(rolleName);
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    await header.logout();
  });

  test('Erfolgreich löschen', async () => {
    rolleManagementViewPage = await rolleDetailsView.deleteRolle();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleDoesNotExist(rolleName);
  });

  // SPSH-2949
  test('Vergebene Rolle löschen und Fehlermeldung prüfen', async ({ page }: PlaywrightTestArgs) => {
    await test.step('Rolle einer Person zuordnen', async () => {
      await createPersonWithPersonenkontext(page, testschuleName, rolleName);
    });
    const alert: Alert<RolleManagementViewPage> = await rolleDetailsView.attemptDeletionOfAssignedRolle();
    await alert.assertExpectedTexts();
    rolleManagementViewPage = await (await alert.confirm()).waitForPageLoad();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleExists(rolleName);
  });
});