import { PlaywrightTestArgs, test } from '@playwright/test';
import { freshLoginPage } from '../../base/api/personApi';
import { systemrechtLabel } from '../../base/berechtigungen';
import { rollenMerkmalLabel } from '../../base/merkmale';
import { testschuleName } from '../../base/organisation';
import { landesadminRolle } from '../../base/rollen';
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
import { deleteRolleByName } from '../../base/testHelperDeleteTestdata';
import { generateRolleName } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleCreationErrorPage } from '../../pages/admin/rollen/RolleCreationError.page';
import { RolleCreationSuccessPage } from '../../pages/admin/rollen/RolleCreationSuccess.page';
import { RolleCreationParams, RolleCreationViewPage } from '../../pages/admin/rollen/RolleCreationView.neu.page';
import { RolleDetailsViewPage } from '../../pages/admin/rollen/RolleDetailsView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.neu.page';
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
  const rollenNamesToDelete: string[] = [];

  test.describe(`Als ${landesadminRolle}`, () => {
    for (const rolleParams of rolleCreationParams) {
      test.describe(`Rolle der Art ${rolleParams.rollenart} erfolgreich anlegen`, () => {

        test.afterEach(async ({ page }: PlaywrightTestArgs) => {
          await deleteRolleByName(rollenNamesToDelete.splice(0), page);
        });

        test('Zusammenfassung prüfen', async ({ page}: PlaywrightTestArgs) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
            const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleParams);
            rollenNamesToDelete.push(rolleParams.name);
            return rolleCreationSuccessPage;
          });
          await test.step('Erfolgsseite prüfen', async () => {
            await rolleCreationSuccessPage.checkSuccessPage(rolleParams);
          });
        });

        test('Gesamtübersicht prüfen', async ({ page}: PlaywrightTestArgs) => {
          const rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
            const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleParams);
            rollenNamesToDelete.push(rolleParams.name);
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
          rollenNamesToDelete.push(rolleParams.name);
          await rolleCreationSuccessPage.checkSuccessPage(rolleParams);
          const rolleManagementViewPage: RolleManagementViewPage = await rolleCreationSuccessPage.backToResultList();
          await rolleManagementViewPage.setPageSize('300');
          await rolleManagementViewPage.checkIfRolleExists(rolleParams.name);
        });
      });
    }

    test.describe('Fehler bei Anlage', () => {
      test('Rolle doppelt anlegen', async ({ page }) => {
        let rolleCreationPage: RolleCreationViewPage = await setupAndGoToRolleCreationPage(page);
        const rolleCreationSuccessPage: RolleCreationSuccessPage = await test.step('Rolle anlegen', async () => {
          const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleCreationParams[0]);
          rollenNamesToDelete.push(rolleCreationParams[0].name);
          return rolleCreationSuccessPage;
        });
        await test.step('Erneut zur Rollenanlage navigieren', async () => {
          rolleCreationPage = await rolleCreationSuccessPage.createAnother();
        });

        const errorPage: RolleCreationErrorPage = await test.step('Erneut Rolle mit gleichem Namen anlegen', async () => {
          return  rolleCreationPage.createRolleWithError(rolleCreationParams[0]);
        });

        await test.step('Fehlermeldung prüfen', async () => {
          await errorPage.checkErrorPage('Der Rollenname ist bereits vergeben. Bitte korrigieren Sie Ihre Eingabe.');
        });
    });
  });
  });

  // TODO: angelegte rolle in gesamtübersicht prüfen

  // TODO: rolle mit ungültigen daten anlegen

  // TODO: login mit user und prüfen auf systemrechte und serviceprovider
});
