import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPersonWithUserContext, freshLoginPage } from '../../base/api/personApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { testschuleName } from '../../base/organisation';
import { generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { Alert } from '../../elements/Alert';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

type SetupResult = [RolleDetailsViewPage, string];
/**
 *
 * @param page
 * @returns [RolleDetailsViewPage, string] - RolleDetailsViewPage und der Name der erstellten Rolle
 */
async function setupAndGoToRolleDetailsPage(page: PlaywrightTestArgs['page']): Promise<SetupResult> {
  return test.step('Anmelden und zur Rollenbearbeitung navigieren', async () => {
    const loginPage: LoginViewPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    const organisationId: string = await getOrganisationId(page, testschuleName);
    const rolleName: string = generateRolleName();
    await createRolle(page, RollenArt.Leit, organisationId, rolleName);
    const personManagementView: PersonManagementViewPage = await startPage.navigateToAdministration();
    const rolleManagementViewPage: RolleManagementViewPage =
      await personManagementView.menu.navigateToRolleManagement();
    rolleManagementViewPage.setPageSize('300');
    return [await rolleManagementViewPage.openGesamtuebersicht(rolleName), rolleName];
  });
}

test.describe(`Testfälle für die Rollenlöschung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    await header.logout();
  });
  test('Erfolgreich löschen', async ({ page }: PlaywrightTestArgs) => {
    const [rolleDetailsView, rolleName]: SetupResult = await setupAndGoToRolleDetailsPage(page);
    const rolleManagementViewPage: RolleManagementViewPage = await rolleDetailsView.deleteRolle();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleDoesNotExist(rolleName);
  });

  test('Vergebene Rolle löschen und Fehlermeldung prüfen', async ({ page }: PlaywrightTestArgs) => {
    const [rolleDetailsView, rolleName]: SetupResult = await setupAndGoToRolleDetailsPage(page);
    await test.step('Rolle einer Person zuordnen', async () => {
      await createPersonWithUserContext(page, testschuleName, generateNachname(), generateVorname(), rolleName);
    });
    const alert: Alert<RolleManagementViewPage> = await rolleDetailsView.attemptDeletionOfAssignedRolle();
    await alert.assertExpectedTexts();
    const rolleManagementViewPage: RolleManagementViewPage = await (await alert.confirm()).waitForPageLoad();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleExists(rolleName);
  });
});
