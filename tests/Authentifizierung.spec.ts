import { expect, type Page, test, type PlaywrightTestArgs } from '@playwright/test';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';
import { LandingViewPage } from '../pages/LandingView.neu.page';
import { HeaderPage } from '../pages/components/Header.neu.page';
import { createPerson, lockPerson, type UserInfo } from '../base/api/personApi';
import { createRolle } from '../base/api/rolleApi';
import { testschuleName } from '../base/organisation';
import { getOrganisationId } from '../base/api/organisationApi';
import { generateRolleName } from '../base/utils/generateTestdata';
import { freshLoginPage } from '../base/api/personApi';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

test.describe(`Testfälle für den Login: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let landingPage: LandingViewPage;
  let loginPage: LoginViewPage;
  let header: HeaderPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    header = new HeaderPage(page);
  });

  test('Erfolgreicher Login', async () => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await expect(startPage.waitForPageLoad()).toBeTruthy();
    await startPage.serviceProvidersAreLoaded();
  });

  test('Fehlgeschlagener Login mit falschen Daten', async () => {
    await loginPage.login('anakin', 'obi-wan');
    await expect(loginPage.loginFailedWithWrongCredentials()).toBeTruthy();
  });

  test('Fehlgeschlagener Login mit gesperrtem Benutzer', async ({ page }: { page: Page }) => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();

    /* create locked user */
    const testSchuleId: string = await getOrganisationId(page, testschuleName)
    const rolleName: string = await generateRolleName();
    const rolleId: string = await createRolle(page, 'LEHR', testSchuleId, rolleName);
    const userinfo: UserInfo = await createPerson(page, testSchuleId, rolleId)
    await lockPerson(page, userinfo.personId, testSchuleId);

    await header.logout();
    loginPage = await freshLoginPage(page);
    await loginPage.login(userinfo.username, userinfo.password);
    await expect(loginPage.loginFailedWithLockedUser()).toBeTruthy();
  });

  test('Erfolgreicher Logout', async () => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();

    await header.logout();
    await expect(landingPage.waitForPageLoad()).toBeTruthy();
  });
});