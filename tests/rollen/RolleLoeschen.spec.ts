import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPersonWithPersonenkontext, freshLoginPage } from '../../base/api/personApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { testschuleName } from '../../base/organisation';
import { generateRolleName } from '../../base/utils/generateTestdata';
import { Alert } from '../../elements/Alert';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

test.describe(`Testfälle für die Rollenlöschung: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let rolleDetailsView: RolleDetailsViewPage;
  let rolleName: string;
  let rollenName2: string;
  let personManagementView: PersonManagementViewPage;
  let rolleManagementViewPage: RolleManagementViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    const loginPage: LoginViewPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
    await startPage.waitForPageLoad();
    const organisationId: string = await getOrganisationId(page, testschuleName);
    
    rollenName2 = generateRolleName();
    await createRolle(page, RollenArt.Leit, organisationId, rollenName2);
    await createPersonWithPersonenkontext(page, testschuleName, rollenName2);
    rolleName = generateRolleName();
    await createRolle(page, RollenArt.Leit, organisationId, rolleName);
    personManagementView = await startPage.goToAdministration();
    rolleManagementViewPage = await personManagementView.menu.navigateToRolleManagement();
    await rolleManagementViewPage.setPageSize('300');
  });

  //TODO: User wird während des Tests ausgeloggt - Ursache unklar
  // test.afterEach(async ({ page }: PlaywrightTestArgs) => {
  //   const header: HeaderPage = new HeaderPage(page);
  //   await header.logout();
  // });

  test('Erfolgreich löschen', async () => {
    
    rolleDetailsView = await rolleManagementViewPage.openGesamtuebersicht(rolleName);
    rolleManagementViewPage = await rolleDetailsView.deleteRolle();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleDoesNotExist(rolleName);
  });

  // SPSH-2949
  test('Vergebene Rolle löschen und Fehlermeldung prüfen', async () => {
    rolleDetailsView = await rolleManagementViewPage.openGesamtuebersicht(rollenName2);
    const alert: Alert<RolleManagementViewPage> = await rolleDetailsView.attemptDeletionOfAssignedRolle();
    await alert.assertExpectedTexts();
    rolleManagementViewPage = await (await alert.confirm()).waitForPageLoad();
    await rolleManagementViewPage.setPageSize('300');
    await rolleManagementViewPage.checkIfRolleExists(rollenName2);
  });
});