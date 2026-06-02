import { expect, test, type Page, type PlaywrightTestArgs } from '@playwright/test';
import { createKlasse, createSchule, getOrganisationId } from '../base/api/organisationApi';
import {
  createPerson,
  createRolleAndPersonWithPersonenkontext,
  freshLoginPage,
  lockPerson,
  type UserInfo,
} from '../base/api/personApi';
import { addSystemrechtToRolle, createRolle, RollenArt } from '../base/api/rolleApi';
import { RollenSystemRechtEnum } from '../base/api/generated/models/RollenSystemRechtEnum';
import { getServiceProviderId, getServiceProviderIds } from '../base/api/serviceProviderApi';
import { testschuleName } from '../base/organisation';
import { adressbuch, email, itslearning, kalender, schoolSH, schulportaladmin } from '../base/sp';
import { DEV, SMOKE, STAGE } from '../base/tags';
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
  let loginPage: LoginViewPage;
  let header: HeaderPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    header = new HeaderPage(page);
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

  test(
    'Landesadmin meldet sich an, navigiert zur Schulportal-Administration und meldet sich ab',
    { tag: [DEV, SMOKE, STAGE] },
    async () => {
      let startPage: StartViewPage;

      await test.step('Anmelden', async () => {
        startPage = await loginPage.login(ADMIN, PASSWORD);
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreVisible([schulportaladmin]);
      });

      await test.step('Zur Schulportal-Administration navigieren', async () => {
        await startPage.navigateToAdministration();
      });

      await test.step('Abmelden', async () => {
        const landingPage: LandingViewPage = await header.logout();
        await landingPage.waitForPageLoad();
      });
    },
  );
});

test.describe('Smoke: Schüler kann sich anmelden, itslearning öffnen und sich abmelden', () => {
  let userInfo: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Testdaten anlegen', async () => {
      await loginAndNavigateToAdministration(page);
      const schuleName: string = generateSchulname();
      const schuleId: string = await createSchule(page, schuleName, generateDienststellenNr());
      const klasseName: string = generateKlassenname();
      const klasseId: string = await createKlasse(page, schuleId, klasseName);
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
    });

    await test.step('Als Schüler anmelden', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.loginNewUserWithPasswordChange(userInfo.username, userInfo.password);
    });
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

test.describe('Smoke: Schuladmin kann sich anmelden, zur Schulportal-Administration navigieren und sich abmelden', () => {
  let userInfo: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Testdaten anlegen', async () => {
      await loginAndNavigateToAdministration(page);
      const spId: string = await getServiceProviderId(page, schulportaladmin);
      userInfo = await createRolleAndPersonWithPersonenkontext(
        page,
        testschuleName,
        RollenArt.Leit,
        generateNachname(),
        generateVorname(),
        [spId],
        generateRolleName(),
      );
      await addSystemrechtToRolle(page, userInfo.rolleId, RollenSystemRechtEnum.PersonenVerwalten);
    });

    await test.step('Als Schuladmin anmelden', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.loginNewUserWithPasswordChange(userInfo.username, userInfo.password);
    });
  });

  test(
    'Schuladmin meldet sich an, navigiert zur Schulportal-Administration und meldet sich ab',
    { tag: [DEV, SMOKE, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startPage: StartViewPage = new StartViewPage(page, userInfo.username);

      await test.step('Startseite prüfen', async () => {
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreVisible([schulportaladmin]);
      });

      await test.step('Zur Schulportal-Administration navigieren', async () => {
        await startPage.navigateToAdministration();
      });

      await test.step('Abmelden', async () => {
        const headerPage: HeaderPage = new HeaderPage(page);
        const landingPage: LandingViewPage = await headerPage.logout();
        await landingPage.waitForPageLoad();
      });
    },
  );
});

test.describe('Smoke: Lehrer kann sich anmelden, auf E-Mail zugreifen und sich abmelden', () => {
  let userInfo: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Testdaten anlegen', async () => {
      await loginAndNavigateToAdministration(page);
      const schuleName: string = generateSchulname();
      const schuleId: string = await createSchule(page, schuleName, generateDienststellenNr());
      void schuleId;
      const spIds: Map<string, string> = await getServiceProviderIds(page, [email, adressbuch, kalender, schoolSH]);
      userInfo = await createRolleAndPersonWithPersonenkontext(
        page,
        schuleName,
        RollenArt.Lehr,
        generateNachname(),
        generateVorname(),
        Array.from(spIds.values()),
        generateRolleName(),
      );
    });

    await test.step('Als Lehrer anmelden', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.loginNewUserWithPasswordChange(userInfo.username, userInfo.password);
    });
  });

  test(
    'Lehrer meldet sich an, navigiert zur E-Mail und meldet sich ab',
    { tag: [DEV, SMOKE, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startPage: StartViewPage = new StartViewPage(page, userInfo.username);

      await test.step('Startseite mit Lehrer-Kacheln prüfen', async () => {
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreVisible([adressbuch, email, kalender]);
      });

      await test.step('E-Mail öffnen', async () => {
        await startPage.navigateToEmail();
      });

      await test.step('Zurück zur Startseite navigieren', async () => {
        await page.goto('/');
        await startPage.waitForPageLoad();
      });

      await test.step('School-SH in neuem Tab öffnen', async () => {
        const schoolSHTab: Page = await startPage.openServiceProviderInNewTab(schoolSH);
        await startPage.assertServiceProviderTabOpened(schoolSHTab, 'school-sh');
      });

      await test.step('Abmelden', async () => {
        const headerPage: HeaderPage = new HeaderPage(page);
        const landingPage: LandingViewPage = await headerPage.logout();
        await landingPage.waitForPageLoad();
      });
    },
  );
});
