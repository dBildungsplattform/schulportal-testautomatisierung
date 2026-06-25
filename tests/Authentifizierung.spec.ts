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
import { testschuleName } from '../base/organisation';
import { adressbuch, email, itslearning, kalender, schoolSH, schulportaladmin } from '../base/sp';
import { DEV, SMOKE, STAGE } from '../base/tags';
import { loginAndNavigateToAdministration, logout } from '../base/testHelperUtils';
import {
  generateDienststellenNr,
  generateKlassenname,
  generateRolleName,
  generateSchulname,
} from '../base/utils/generateTestdata';
import { LandingViewPage } from '../pages/LandingView.page';
import { LoginViewPage } from '../pages/LoginView.page';
import { Keycloak2FAPage } from '../pages/Keycloak2FA.page';
import { StartViewPage } from '../pages/StartView.page';
import { TwoFactorWorkflowPage } from '../pages/TwoFactorWorkflow.page';
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
      userInfo = await createRolleAndPersonWithPersonenkontext(page, {
        organisationName: schuleName,
        rollenArt: RollenArt.Lern,
        serviceProviderNames: [itslearning],
        klasseId,
      });
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
        await startPage.openServiceProviderInNewTab(itslearning);
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
      userInfo = await createRolleAndPersonWithPersonenkontext(page, {
        organisationName: testschuleName,
        rollenArt: RollenArt.Leit,
        serviceProviderNames: [schulportaladmin],
      });
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
  let userPassword: string;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Testdaten anlegen', async () => {
      await loginAndNavigateToAdministration(page);
      const schuleName: string = generateSchulname();
      await createSchule(page, schuleName, generateDienststellenNr());
      userInfo = await createRolleAndPersonWithPersonenkontext(page, {
        organisationName: schuleName,
        rollenArt: RollenArt.Lehr,
        serviceProviderNames: [email, adressbuch, kalender, schoolSH],
      });
    });

    await test.step('Als Lehrer anmelden', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.login(userInfo.username, userInfo.password);
      userPassword = await loginViewPage.updatePassword();
      await new StartViewPage(page, userInfo.username).waitForPageLoad();
    });

    await test.step('2FA einrichten', async () => {
      const headerPage: HeaderPage = new HeaderPage(page);
      await headerPage.navigateToProfile();
      const twoFactorWorkflow: TwoFactorWorkflowPage = new TwoFactorWorkflowPage(page);
      await twoFactorWorkflow.setupTwoFactorAuthenticationFromProfile();
    });

    await test.step('Neu anmelden nach 2FA-Einrichtung', async () => {
      await logout(page);
      const loginViewPage: LoginViewPage = await freshLoginPage(page);
      await loginViewPage.login(userInfo.username, userPassword);
      await new StartViewPage(page, userInfo.username).waitForPageLoad();
    });
  });

  test(
    'Lehrer meldet sich an, navigiert zur E-Mail und meldet sich ab',
    { tag: [SMOKE, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startPage: StartViewPage = new StartViewPage(page, userInfo.username);

      await test.step('Startseite mit Lehrer-Kacheln prüfen', async () => {
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreLoaded();
        await startPage.assertServiceProvidersAreVisible([adressbuch, email, kalender]);
      });

      await test.step('E-Mail öffnen', async () => {
        const emailUrl: string = await startPage.getServiceProviderUrl(email);
        const emailTab: Page = await page.context().newPage();
        await emailTab.goto(emailUrl);

        const keycloak2FA: Keycloak2FAPage = new Keycloak2FAPage(emailTab, userInfo.username);

        const isOtpRequired: boolean = await keycloak2FA
          .waitForPageLoad()
          .then(() => true)
          .catch(() => false);

        if (isOtpRequired) {
          await keycloak2FA.enterOtpForTwoFactorAuthentication();
        }

        await emailTab.waitForURL(/webmail.*\/mail/, { timeout: 30_000 });
        await emailTab.close();
      });

      await test.step('Zurück zur Startseite navigieren', async () => {
        await page.goto('/');
        await startPage.waitForPageLoad();
        await startPage.assertServiceProvidersAreLoaded();
      });

      await test.step('School-SH in neuem Tab öffnen', async () => {
        await startPage.openServiceProviderInNewTab(schoolSH);
      });

      await test.step('Abmelden', async () => {
        const headerPage: HeaderPage = new HeaderPage(page);
        const landingPage: LandingViewPage = await headerPage.logout();
        await landingPage.waitForPageLoad();
      });
    },
  );
});
