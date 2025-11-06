import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { createPersonWithUserContext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { systemrechtLabel } from '../../base/berechtigungen';
import { rollenMerkmalLabel } from '../../base/merkmale';
import { landSH, testschuleName } from '../../base/organisation';
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
import { generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleCreationSuccessPage } from '../../pages/admin/rollen/RolleCreationSuccess.page';
import { RolleCreationParams, RolleCreationViewPage } from '../../pages/admin/rollen/RolleCreationView.neu.page';
import { RolleManagementViewPage } from '../../pages/admin/rollen/RolleManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

const rolleCreationParams: RolleCreationParams[] = [
  {
    name: generateRolleName(),
    schulname: testschuleName,
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
    schulname: testschuleName,
    rollenart: 'Lern',
    merkmale: [],
    systemrechte: [],
    serviceProviders: [itslearning, webUntis],
  },
  {
    name: generateRolleName(),
    schulname: testschuleName,
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
  });

  // TODO: angelegte rolle in ergebnisliste prüfen

  // TODO: angelegte rolle in gesamtübersicht prüfen

  // TODO: rolle mit ungültigen daten anlegen

  // TODO: rolle doppelt anlegen

  // TODO: login mit user und prüfen auf systemrechte und serviceprovider
});
