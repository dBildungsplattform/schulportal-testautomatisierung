import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../base/api/personApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import { testschuleName } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { email } from '../base/sp';
import { DEV, STAGE } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { TestHelperLdap } from '../base/testHelperLdap';
import { gotoTargetURL, loginAndNavigateToAdministration } from '../base/testHelperUtils';
import {
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/utils/generateTestdata';
import { LandingViewPage } from '../pages/LandingView.page';
import { LoginViewPage } from '../pages/LoginView.page';
import { ProfileViewPage } from '../pages/ProfileView.page';
import { StartViewPage } from '../pages/StartView.page';
import { PersonDetailsViewPage } from '../pages/admin/personen/details/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../pages/components/Header.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];

test.describe('Inbetriebnahme-Passwort einrichten', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Login', async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const landing: LandingViewPage = new LandingViewPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const startseite: StartViewPage = new StartViewPage(page);

    await test.step('Offene Dialoge schließen', async () => {
      try {
        await page.keyboard.press('Escape');
      } catch {
        // ignore if no dialog open
      }
    });

    if (!currentUserIsLandesadministrator) {
      await test.step('Zurück zum Admin wechseln', async () => {
        await header.logout();
        await landing.navigateToLogin();
        await login.login(ADMIN!, PW!);
        await startseite.assertServiceProvidersAreLoaded();
      });
    }

    await test.step('Testdaten löschen', async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }

      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
      }
    });

    await test.step('Abmelden', async () => {
      try {
        await header.logout();
      } catch {
        // ignore if already logged out
      }
    });
  });

  test(
    'Inbetriebnahme-Passwort als Lehrer über das eigene Profil erzeugen',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      let userInfoLehrer: UserInfo;

      await test.step('Testdaten: Lehrer anlegen', async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
          generateKopersNr(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      await test.step('Als Lehrer anmelden', async () => {
        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfoLehrer.username, userInfoLehrer.password);
        await login.updatePassword();
        currentUserIsLandesadministrator = false;
      });

      const devicePassword: string = await test.step('Inbetriebnahme-Passwort erzeugen', async () => {
        await header.navigateToProfile();
        await profileView.waitForPageLoad();
        return profileView.resetDevicePassword();
      });

      await test.step('Passwort in LDAP prüfen', async () => {
        const ldapHelper: TestHelperLdap = new TestHelperLdap(
          process.env.LDAP_URL!,
          process.env.LDAP_ADMIN_PASSWORD!,
        );
        expect(
          await ldapHelper.validatePasswordMatchesUEMPassword(userInfoLehrer.username, devicePassword),
        ).toBeTruthy();
      });
    },
  );

  test(
    'Inbetriebnahme-Passwort über die Gesamtübersicht erzeugen',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step('Testdaten: Lehrer anlegen', async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
          generateKopersNr(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
        return new PersonDetailsViewPage(page);
      });

      const devicePassword: string = await test.step('Inbetriebnahme-Passwort erzeugen', async () => {
        return personDetailsView.createInbetriebnahmePasswort();
      });

      await test.step('Passwort in LDAP prüfen', async () => {
        const ldapHelper: TestHelperLdap = new TestHelperLdap(
          process.env.LDAP_URL!,
          process.env.LDAP_ADMIN_PASSWORD!,
        );
        expect(
          await ldapHelper.validatePasswordMatchesUEMPassword(userInfoLehrer.username, devicePassword),
        ).toBeTruthy();
      });
    },
  );
});
