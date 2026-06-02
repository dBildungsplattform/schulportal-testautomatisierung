import { expect, test, type Page, type PlaywrightTestArgs } from '@playwright/test';
import { createKlasse, createSchule, getOrganisationId } from '../base/api/organisationApi';
import { createPerson, createRolleAndPersonWithPersonenkontext, freshLoginPage, lockPerson, type UserInfo } from '../base/api/personApi';
import { createRolle, RollenArt } from '../base/api/rolleApi';
import { getServiceProviderIds } from '../base/api/serviceProviderApi';
import { testschuleName } from '../base/organisation';
import { itslearning } from '../base/sp';
import { DEV, SMOKE, STAGE } from '../base/tags';
import { deleteKlasseByName, deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { loginAndNavigateToAdministration, logout } from '../base/testHelperUtils';
import {
  generateDienststellenNr,
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateSchulname,
  generateVorname,
} from '../base/utils/generateTestdata';
import { LandingViewPage } from '../pages/LandingView.page';
import { LoginViewPage } from '../pages/LoginView.page';
import { StartViewPage } from '../pages/StartView.page';
import { HeaderPage } from '../pages/components/Header.page';

const ADMIN: string = process.env.USER!;
const PASSWORD: string = process.env.PW!;

test.describe(`Testfälle für den Login: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let landingPage: LandingViewPage;
  let loginPage: LoginViewPage;
  let header: HeaderPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    header = new HeaderPage(page);
  });

  test('Erfolgreicher Login', { tag: [SMOKE, DEV, STAGE] }, async () => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    await startPage.assertServiceProvidersAreLoaded();
  });

  test('Fehlgeschlagener Login mit falschen Daten', { tag: [SMOKE, DEV, STAGE] }, async () => {
    await loginPage.login('anakin', 'obi-wan');
    await expect(loginPage.loginFailedWithWrongCredentials()).resolves.toBeUndefined();
  });

  test('Fehlgeschlagener Login mit gesperrtem Benutzer', { tag: [STAGE, DEV] }, async ({ page }: { page: Page }) => {
    await loginAndNavigateToAdministration(page);

    /* create locked user */
    const testSchuleId: string = await getOrganisationId(page, testschuleName);
    const rolleName: string = generateRolleName();
    const rolleId: string = await createRolle(page, RollenArt.Lehr, testSchuleId, rolleName);
    const userinfo: UserInfo = await createPerson(page, testSchuleId, rolleId);
    await lockPerson(page, userinfo.personId, testSchuleId);

    await header.logout();
    loginPage = await freshLoginPage(page);
    await loginPage.login(userinfo.username, userinfo.password);
    await expect(loginPage.loginFailedWithLockedUser()).resolves.toBeUndefined();
  });

  test('Erfolgreicher Logout', { tag: [STAGE, DEV, SMOKE] }, async () => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();

    landingPage = await header.logout();
    await landingPage.waitForPageLoad();
  });
});

test.describe('Smoke: Schüler kann sich anmelden, itslearning öffnen und sich abmelden', () => {
  let userInfo: UserInfo;
  let rolleIds: string[] = [];
  let usernames: string[] = [];
  let klassenNamen: string[] = [];

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Testdaten anlegen', async () => {
      await loginAndNavigateToAdministration(page);
      const schuleName: string = generateSchulname();
      const schuleId: string = await createSchule(page, schuleName, generateDienststellenNr());
      const klasseName: string = generateKlassenname();
      const klasseId: string = await createKlasse(page, schuleId, klasseName);
      klassenNamen.push(klasseName);
      const rolleName: string = generateRolleName();
      const itslearningSpIds: Map<string, string> = await getServiceProviderIds(page, [itslearning]);
      userInfo = await createRolleAndPersonWithPersonenkontext(
        page,
        schuleName,
        RollenArt.Lern,
        generateNachname(),
        generateVorname(),
        Array.from(itslearningSpIds.values()),
        rolleName,
        undefined,
        klasseId,
      );
      rolleIds.push(userInfo.rolleId);
      usernames.push(userInfo.username);
    });

    await test.step('Als Schüler anmelden', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.loginNewUserWithPasswordChange(userInfo.username, userInfo.password);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await page.context().clearCookies();
    await loginAndNavigateToAdministration(page);
    if (usernames.length > 0) {
      await deletePersonenBySearchStrings(page, usernames);
      usernames = [];
    }
    if (rolleIds.length > 0) {
      await deleteRolleById(rolleIds, page);
      rolleIds = [];
    }
    if (klassenNamen.length > 0) {
      await deleteKlasseByName(klassenNamen, page);
      klassenNamen = [];
    }
  });

  test(
    'Schüler meldet sich an, öffnet itslearning und meldet sich ab',
    { tag: [SMOKE, DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startPage: StartViewPage = new StartViewPage(page);

      await test.step('Startseite mit itslearning-Kachel prüfen', async () => {
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreVisible([itslearning]);
      });

      await test.step('itslearning in neuem Tab öffnen', async () => {
        const itslearningTab: Page = await startPage.openServiceProviderInNewTab(itslearning);
        await startPage.assertServiceProviderTabOpened(itslearningTab, 'itsl');
      });

      await test.step('Abmelden', async () => {
        const headerPage: HeaderPage = new HeaderPage(page);
        const landingPage: LandingViewPage = await headerPage.logout();
        await landingPage.waitForPageLoad();
      });
    },
  );
});
