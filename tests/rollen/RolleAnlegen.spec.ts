import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPerson, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { getRolleId, RollenMerkmal } from '../../base/api/rolleApi';
import { systemrechtLabel } from '../../base/berechtigungen';
import { klasse1Testschule } from '../../base/klassen';
import { rollenMerkmalLabel } from '../../base/merkmale';
import { testschuleName } from '../../base/organisation';
import { landesadminRolle } from '../../base/rollen';
import { rollenArtLabel } from '../../base/rollentypen';
import {
  adressbuch,
  anleitungen,
  email,
  helpdeskKontaktieren,
  itslearning,
  kalender,
  opSH,
  psychosozialesBeratungsangebot,
  schoolSH,
  schulrechtAZ,
  webUntis,
} from '../../base/sp';
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

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

const rolleCreationParams: RolleCreationParams[] = [
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: 'Lehr',
    merkmale: [rollenMerkmalLabel.BEFRISTUNG_PFLICHT, rollenMerkmalLabel.KOPERS_PFLICHT],
    systemrechte: [],
    serviceProviders: [
      email,
      itslearning,
      kalender,
      adressbuch,
      opSH,
      schoolSH,
      webUntis,
      anleitungen,
      helpdeskKontaktieren,
      psychosozialesBeratungsangebot,
      schulrechtAZ,
    ],
  },
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: 'Lern',
    merkmale: [],
    systemrechte: [],
    serviceProviders: [itslearning, webUntis],
  },
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: 'Leit',
    merkmale: [],
    systemrechte: [
      systemrechtLabel.LANDESBEDIENSTETE_SUCHEN_UND_HINZUFUEGEN,
      systemrechtLabel.KLASSEN_VERWALTEN,
      systemrechtLabel.EINGESCHRAENKT_NEUE_BENUTZER_ERSTELLEN,
      systemrechtLabel.PERSONEN_VERWALTEN,
    ],
    serviceProviders: [itslearning, webUntis],
  },
];

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

  test.describe(`Als ${landesadminRolle}`, () => {
    for (const rolleParams of rolleCreationParams) {
      test.describe(`Rolle der Art ${rolleParams.rollenart} erfolgreich anlegen`, () => {

        test('Zusammenfassung prüfen', async ({ page }: PlaywrightTestArgs) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
            const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleParams);
            return rolleCreationSuccessPage;
          });
          await test.step('Erfolgsseite prüfen', async () => {
            await rolleCreationSuccessPage.checkSuccessPage(rolleParams);
          });
        });

        test('Gesamtübersicht prüfen', async ({ page }: PlaywrightTestArgs) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
            const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleParams);
            return rolleCreationSuccessPage;
          });
          const rolleDetailsView: RolleDetailsViewPage = await test.step('Zur Gesamtübersicht navigieren', async () => {
            await rolleCreationSuccessPage.checkSuccessPage(rolleParams);
            const rolleManagementViewPage: RolleManagementViewPage = await rolleCreationSuccessPage.backToResultList();
            await rolleManagementViewPage.setPageSize('300');
            return await rolleManagementViewPage.openGesamtuebersicht(rolleParams.name);
          });

          await test.step('Gesamtübersicht prüfen', async () => {
            await rolleDetailsView.checkGesamtuebersicht(rolleParams);
          });
        });

        test('In der Ergebnisliste prüfen', async ({ page }) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleParams);
          await rolleCreationSuccessPage.checkSuccessPage(rolleParams);
          const rolleManagementViewPage: RolleManagementViewPage = await rolleCreationSuccessPage.backToResultList();
          await rolleManagementViewPage.setPageSize('300');
          await rolleManagementViewPage.checkIfRolleExists(rolleParams.name);
          await rolleManagementViewPage.checkIfRolleHasServiceProviders(rolleParams.name, rolleParams.serviceProviders);
        });

        test('Als Nutzer mit der neuen Rolle anmelden', async ({ page }) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          await rolleCreationPage.createRolle(rolleParams);
          const organisationId: string = await getOrganisationId(page, testschuleName);
          const rolleId: string = await getRolleId(page, rolleParams.name);
          let user: UserInfo;
          if (rolleParams.rollenart === rollenArtLabel.LERN) {
            const klasseId: string = await getOrganisationId(page, klasse1Testschule);
            user = await createPerson(
              page,
              organisationId,
              rolleId,
              generateNachname(),
              generateVorname(),
              undefined,
              klasseId,
              new Set(
                rolleParams.merkmale.includes(rollenMerkmalLabel.BEFRISTUNG_PFLICHT)
                  ? [RollenMerkmal.BefristungPflicht]
                  : []
              )
            );
          } else {
            user = await createPerson(
              page,
              organisationId,
              rolleId,
              generateNachname(),
              generateVorname(),
              undefined,
              undefined,
              new Set(
                rolleParams.merkmale.includes(rollenMerkmalLabel.BEFRISTUNG_PFLICHT)
                  ? [RollenMerkmal.BefristungPflicht]
                  : []
              )
            );
          }
          const header: HeaderPage = new HeaderPage(page);
          await header.logout();
          const loginPage: LoginViewPage = await freshLoginPage(page);
          const startViewPage: StartViewPage = await loginPage.login(user.username, user.password);
          await loginPage.updatePassword();
          await startViewPage.waitForPageLoad();
          startViewPage.serviceProviderIsVisible(rolleParams.serviceProviders);
        });
      });
    }

    test.describe('Fehler bei Anlage', () => {
      test('Rolle doppelt anlegen', async ({ page }) => {
        let rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(
            rolleCreationParams[0]
          );
          return rolleCreationSuccessPage;
        });
        await test.step('Erneut zur Rollenanlage navigieren', async () => {
          rolleCreationPage = await rolleCreationSuccessPage.createAnother();
        });

        const errorPage: RolleCreationErrorPage =
          await test.step('Erneut Rolle mit gleichem Namen anlegen', async () => {
            return rolleCreationPage.createRolleWithError(rolleCreationParams[0]);
          });

        await test.step('Fehlermeldung prüfen', async () => {
          await errorPage.checkErrorPage('Der Rollenname ist bereits vergeben. Bitte korrigieren Sie Ihre Eingabe.');
        });
      });

      test('Ungültige Eingaben', async ({ page }) => {
        const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
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
});
