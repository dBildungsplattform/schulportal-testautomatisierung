import { PlaywrightTestArgs, test } from '@playwright/test';
import {
  createPerson,
  createRolleAndPersonWithPersonenkontext,
  setTimeLimitPersonenkontext,
  UserInfo,
} from '../../base/api/personApi';
import { testschuleName } from '../../base/organisation';
import { typeLehrer } from '../../base/rollentypen';
import { DEV, STAGE } from '../../base/tags';
import { login, loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  formatDateDMY,
  generateCurrentDate,
  generateNachname,
  generateRolleName,
  generateSchulname,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { createSchule } from '../../base/api/organisationApi';
import { createRolle, RollenArt } from '../../base/api/rolleApi';
import { OrganisationResponse, RollenMerkmal } from '../../base/api/generated';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { start } from 'repl';

interface TestFixture {
  timeLimit: Date;
  expectedColor: 'orange' | 'red';
}

const testFixtures: TestFixture[] = [
  {
    timeLimit: generateCurrentDate({ days: 50, months: 0 }),
    expectedColor: 'orange',
  },
  {
    timeLimit: generateCurrentDate({ days: 12, months: 0 }),
    expectedColor: 'red',
  },
];

test.describe('Newsbox auf Startseite', () => {
  let schulName: string;
  let rollenName: string;
  let userInfo: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await loginAndNavigateToAdministration(page);

    schulName = generateSchulname();
    rollenName = generateRolleName();
    const rollenMerkmale: Set<RollenMerkmal> = new Set([RollenMerkmal.BefristungPflicht]);
    let schuleId: string = await createSchule(page, schulName);
    let rolleId: string = await createRolle(page, RollenArt.Lehr, schuleId, rollenName, rollenMerkmale);
    userInfo = await createPerson(page, schuleId, rolleId, undefined, undefined, undefined, undefined, rollenMerkmale);
  });

  for (const { timeLimit, expectedColor } of testFixtures) {
    test(
      `News-Box ist ${expectedColor} bei befristeter Schulzuordnung`,
      { tag: [STAGE, DEV] },
      async ({ page }: PlaywrightTestArgs) => {
        const landingPage: LandingViewPage = await test.step('Setup Befristung', async () => {
          await setTimeLimitPersonenkontext(
            page,
            userInfo.personId,
            userInfo.organisationId,
            userInfo.rolleId,
            timeLimit,
          );
          const headerPage = new HeaderPage(page);
          return headerPage.logout();
        });

        const startPage: StartViewPage = await test.step('Login', async () => {
          const loginPage: LoginViewPage = await landingPage.navigateToLogin();
          const startPage: StartViewPage = await loginPage.login(userInfo.username, userInfo.password);
          await loginPage.updatePassword();
          return startPage;
        });

        await test.step('Newsbox prüfen', async () => {
          await startPage.assertNewsbox({ schulName, rollenName: rollenName, timeLimit }, expectedColor);
        });
      },
    );
  }
});
