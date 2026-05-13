import test, { expect, PlaywrightTestArgs } from '@playwright/test';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { loginAndNavigateToAdministration, logout } from '../../base/testHelperUtils';
import { createSchule, getOrganisationId } from '../../base/api/organisationApi';
import { generateRolleName, generateSchulname } from '../../base/utils/generateTestdata';
import { createRolle, getRolleId, RollenArt } from '../../base/api/rolleApi';
import { createPerson, createPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import {
  landesadminRolle,
  lehrerImVorbereitungsdienstRolle,
  lehrkraftOeffentlichRolle,
  religionsLehrkraftRolle,
  schuladminOeffentlichRolle,
} from '../../base/rollen';
import { landSH } from '../../base/organisation';
import { LandingViewPage } from '../../pages/LandingView.page';
import { LoginViewPage } from '../../pages/LoginView.page';
import { StartViewPage } from '../../pages/StartView.page';
import { RolleZuordnenPage } from '../../pages/admin/personen/mehrfachbearbeitung/RolleZuordnen.page';
import { userInfo } from 'os';

interface TestFixture {
  adminType: 'Schuladmin' | 'Landesadmin';
  rollenName: string;
  shouldKopersTextBeVisible: boolean;
  expectedBefristung: 'schuljahresende' | 'unbefristet';
}
for (const { adminType, rollenName, shouldKopersTextBeVisible, expectedBefristung } of [
  {
    adminType: 'Schuladmin',
    rollenName: lehrkraftOeffentlichRolle,
    shouldKopersTextBeVisible: true,
    expectedBefristung: 'unbefristet',
  },
  {
    adminType: 'Schuladmin',
    rollenName: religionsLehrkraftRolle,
    shouldKopersTextBeVisible: false,
    expectedBefristung: 'unbefristet',
  },
  {
    adminType: 'Landesadmin',
    rollenName: lehrerImVorbereitungsdienstRolle,
    shouldKopersTextBeVisible: true,
    expectedBefristung: 'schuljahresende',
  },
] as Array<TestFixture>) {
  test.describe(`Als ${adminType}`, () => {
    let schulName: string;
    let rolleName: string;
    let adminUserInfo: UserInfo;
    let userInfos: UserInfo[] = [];

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      await loginAndNavigateToAdministration(page);
      schulName = generateSchulname();
      rolleName = generateRolleName();
      const schuleId: string = await createSchule(page, schulName);
      const rolleId: string = await createRolle(page, RollenArt.Lehr, schuleId, rolleName);
      userInfos = await Promise.all(Array.from({ length: 5 }).map(() => createPerson(page, schuleId, rolleId)));
      const adminRolleId: string = await getRolleId(
        page,
        adminType === 'Schuladmin' ? schuladminOeffentlichRolle : landesadminRolle,
      );
      const adminOrgaId: string = adminType === 'Schuladmin' ? schuleId : await getOrganisationId(page, landSH);
      adminUserInfo = await createPerson(page, adminOrgaId, adminRolleId);

      const landingPage: LandingViewPage = await logout(page);
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
        adminUserInfo.username,
        adminUserInfo.password,
      );
      await startPage.navigateToAdministration();
    });

    test(`Rolle ${rollenName} per Mehrfachbearbeitung zuweisen`, async ({ page }: PlaywrightTestArgs) => {
      let personManagementViewPage: PersonManagementViewPage = new PersonManagementViewPage(page);
      await test.step('Personen auswählen', async () => {
        if (adminType === 'Landesadmin') {
          await personManagementViewPage.filterBySchule(schulName);
        }
        await personManagementViewPage.filterByRolle(rolleName);
        await personManagementViewPage.checkRowCount(userInfos.length);
        await personManagementViewPage.toggleSelectAllRows(true);
      });

      const rolleZuordnenPage: RolleZuordnenPage = await test.step('Mehrfachbearbeitung auswählen', async () => {
        const rolleZuordnenPage: RolleZuordnenPage | void =
          await personManagementViewPage.selectMehrfachauswahl('Rolle zuordnen');
        expect(rolleZuordnenPage).toBeInstanceOf(RolleZuordnenPage);
        return rolleZuordnenPage as RolleZuordnenPage;
      });

      if (adminType === 'Schuladmin') {
        await test.step('Prüfen, dass Schule vorausgewählt ist', async () => {
          await rolleZuordnenPage.assertSelectedOrganisation(schulName);
        });
      } else {
        await test.step('Schule auswählen', async () => {
          await rolleZuordnenPage.selectOrganisation(schulName);
        });
      }

      await test.step(`Rolle ${rollenName} auswählen und Prüfen, dass der Submit-Button aktiviert ist`, async () => {
        await rolleZuordnenPage.selectRolle(rollenName);
        await rolleZuordnenPage.assertSubmitButtonEnabled();
      });

      await test.step('Ausgewählte Befristungsoption prüfen', async () => {
        if (expectedBefristung === 'schuljahresende') {
          await rolleZuordnenPage.assertSchuljahresendeChecked();
        } else {
          await rolleZuordnenPage.assertUnbefristetChecked();
        }
      });

      await test.step('KoPers.-Hinweis prüfen', async () => {
        if (shouldKopersTextBeVisible) {
          await rolleZuordnenPage.assertKopersTextIsVisible();
        } else {
          await rolleZuordnenPage.assertKopersTextIsNotVisible();
        }
      });

      await test.step('Ausführen und Erfolgsmeldung prüfen', async () => {
        await rolleZuordnenPage.executeAction();
        await rolleZuordnenPage.assertSuccessMessageIsVisible();
      });

      personManagementViewPage = await test.step('Dialog schließen', async () => {
        return rolleZuordnenPage.closeModal();
      });

      await test.step('Prüfen, dass die Rolle korrekt zugeordnet wurde und die Auswahl bestehen bleibt', async () => {
        await personManagementViewPage.assertThatAllPersonsHaveRolle(rollenName);
        await Promise.all(
          userInfos.map(async (userInfo: UserInfo) => {
            return personManagementViewPage.checkPersonSelected(userInfo.username);
          }),
        );
      });
    });
  });
}
