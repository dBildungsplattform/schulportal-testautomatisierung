import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPerson, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { getRolleId, RollenMerkmal } from '../../base/api/rolleApi';
import { klasse1Testschule } from '../../base/klassen';
import { rollenMerkmalLabel } from '../../base/merkmale';
import { testschuleName } from '../../base/organisation';
import { rollenArtLabel } from '../../base/rollentypen';
import { generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleCreationErrorPage } from '../../pages/admin/rollen/RolleCreationError.page';
import { RolleCreationSuccessPage } from '../../pages/admin/rollen/RolleCreationSuccess.page';
import { RolleCreationParams, RolleCreationViewPage } from '../../pages/admin/rollen/RolleCreationView.neu.page';
import { RolleCreationWorkflow } from '../../pages/admin/rollen/RolleCreationWorkflow.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { rolleCreationParams } from './RolleAnlegen.data';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

async function setupAndGoToRolleCreationPage(page: PlaywrightTestArgs['page']): Promise<RolleCreationViewPage> {
  return test.step('Anmelden und zur Rollenanlage navigieren', async () => {
    const loginPage: LoginViewPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    const personManagementView: PersonManagementViewPage = await startPage.navigateToAdministration();
    return personManagementView.menu.navigateToRolleCreation();
  });
}

test.describe(`Testfälle für die Rollenanlage: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  for (const baseRolleParams of rolleCreationParams) {
    test.describe(`Rolle der Art ${baseRolleParams.rollenart} erfolgreich anlegen`, () => {
      let rolleCreationPage: RolleCreationViewPage;

      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        rolleCreationPage = await setupAndGoToRolleCreationPage(page);
      });

      test('Rolle anlegen und Zusammenfassung prüfen', async ({ page }: PlaywrightTestArgs) => {
        const params: RolleCreationParams = { ...baseRolleParams, name: generateRolleName() };
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(params);
          return rolleCreationSuccessPage;
        });
        await test.step('Erfolgsseite prüfen', async () => {
          await rolleCreationSuccessPage.checkSuccessPage(params);
        });
      });

      test('Rolle anlegen und Gesamtübersicht prüfen', async ({ page }: PlaywrightTestArgs) => {
        const params: RolleCreationParams = { ...baseRolleParams, name: generateRolleName() };
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(params);
          return rolleCreationSuccessPage;
        });
        const rolleDetailsView: RolleDetailsViewPage = await test.step('Zur Gesamtübersicht navigieren', async () => {
          await rolleCreationSuccessPage.checkSuccessPage(params);
          const rolleManagementViewPage: RolleManagementViewPage = await rolleCreationSuccessPage.backToResultList();
          await rolleManagementViewPage.setPageSize('300');
          return await rolleManagementViewPage.openGesamtuebersicht(params.name);
        });

        await test.step('Gesamtübersicht prüfen', async () => {
          await rolleDetailsView.checkGesamtuebersicht(params);
        });
      });

      test('Rolle anlegen und Ergebnisliste prüfen', async ({ page }: PlaywrightTestArgs) => {
        const params: RolleCreationParams = { ...baseRolleParams, name: generateRolleName() };
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(params);
        await rolleCreationSuccessPage.checkSuccessPage(params);
        const rolleManagementViewPage: RolleManagementViewPage = await rolleCreationSuccessPage.backToResultList();
        await rolleManagementViewPage.setPageSize('300');
        await rolleManagementViewPage.checkIfRolleExists(params.name);
        await rolleManagementViewPage.checkIfRolleHasServiceProviders(params.name, params.serviceProviders);
      });

      test('Als Nutzer mit einer neu angelegten Rolle anmelden', async ({ page }: PlaywrightTestArgs) => {
        const params: RolleCreationParams = { ...baseRolleParams, name: generateRolleName() };
        await rolleCreationPage.createRolle(params);
        const organisationId: string = await getOrganisationId(page, testschuleName);
        const rolleId: string = await getRolleId(page, params.name);
        let user: UserInfo = await createPerson(
          page,
          organisationId,
          rolleId,
          generateNachname(),
          generateVorname(),
          undefined,
          params.rollenart === rollenArtLabel.LERN ? await getOrganisationId(page, klasse1Testschule) : undefined,
          new Set(
            params.merkmale.includes(rollenMerkmalLabel.BEFRISTUNG_PFLICHT) ? [RollenMerkmal.BefristungPflicht] : []
          )
        );
        const header: HeaderPage = new HeaderPage(page);
        await header.logout();
        const loginPage: LoginViewPage = await freshLoginPage(page);
        const startViewPage: StartViewPage = await loginPage.login(user.username, user.password);
        await loginPage.updatePassword();
        await startViewPage.waitForPageLoad();
        startViewPage.serviceProvidersAreVisible(params.serviceProviders);
      });
    });
  }

  test.describe('Fehler bei Anlage', () => {
    let rolleCreationPage: RolleCreationViewPage;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      rolleCreationPage = await setupAndGoToRolleCreationPage(page);
    });

    test('Rolle doppelt anlegen', async ({ page }: PlaywrightTestArgs) => {
      const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(
          rolleCreationParams[0]
        );
        return rolleCreationSuccessPage;
      });
      await test.step('Erneut zur Rollenanlage navigieren', async () => {
        rolleCreationPage = await rolleCreationSuccessPage.createAnother();
      });

      const errorPage: RolleCreationErrorPage = await test.step('Erneut Rolle mit gleichem Namen anlegen', async () => {
        return rolleCreationPage.createRolleWithError(rolleCreationParams[0]);
      });

      await test.step('Fehlermeldung prüfen', async () => {
        await errorPage.checkErrorPage('Der Rollenname ist bereits vergeben. Bitte korrigieren Sie Ihre Eingabe.');
      });
    });

    test('Ungültige Eingaben', async ({ page }: PlaywrightTestArgs) => {
      const rolleCreationWorkflow: RolleCreationWorkflow = rolleCreationPage.startRolleCreationWorkflow();

      await rolleCreationWorkflow.selectAdministrationsebene(testschuleName);
      await rolleCreationWorkflow.selectArt(rollenArtLabel.LEIT);

      await rolleCreationWorkflow.selectName('a'.repeat(256));
      await rolleCreationWorkflow.checkMessage('name', 'Der Rollenname darf nicht länger als 200 Zeichen sein.');

      const illegalCharacters: string[] = ['!', '"', '§', '$', '%', '&', '/', '<', '>', '{', '}', '[', ']'];
      for (const char of illegalCharacters) {
        await rolleCreationWorkflow.selectName(char);
        await rolleCreationWorkflow.checkMessage('name', 'Der Rollenname darf keine ungültigen Zeichen beinhalten.');
      }
    });
  });
});
