import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../base/api/personApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import { testschuleName } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { email } from '../base/sp';
import { DEV } from '../base/tags';
import { TestHelperLdap } from '../base/testHelperLdap';
import { gotoTargetURL, loginAndNavigateToAdministration } from '../base/testHelperUtils';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../base/utils/generateTestdata';
import { LoginViewPage } from '../pages/LoginView.page';
import { ProfileViewPage } from '../pages/ProfileView.page';
import { PersonDetailsViewPage } from '../pages/admin/personen/details/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../pages/components/Header.page';

test.describe('Inbetriebnahme-Passwort einrichten (LDAP erforderlich)', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Login', async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Offene Dialoge schließen', async () => {
      try {
        await page.keyboard.press('Escape');
      } catch {
        // ignore if no dialog open
      }
    });
  });

  test(
    'Inbetriebnahme-Passwort als Lehrer über das eigene Profil erzeugen (LDAP erforderlich)',
    { tag: [DEV] },
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
      });

      await test.step('Als Lehrer anmelden', async () => {
        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfoLehrer.username, userInfoLehrer.password);
        await login.updatePassword();
      });

      const inbetriebnahmePasswort: string = await test.step('Inbetriebnahme-Passwort erzeugen', async () => {
        await header.navigateToProfile();
        await profileView.waitForPageLoad();
        return profileView.resetInbetriebnahmePasswort();
      });

      await test.step('Passwort in LDAP prüfen', async () => {
        const ldapHelper: TestHelperLdap = new TestHelperLdap(
          process.env.LDAP_URL!,
          process.env.LDAP_ADMIN_USER!,
          process.env.LDAP_ADMIN_PASSWORD!,
        );
        expect(
          await ldapHelper.validateInbetriebnahmePasswortMatches(userInfoLehrer.username, inbetriebnahmePasswort),
        ).toBeTruthy();
      });
    },
  );

  test(
    'Inbetriebnahme-Passwort über die Gesamtübersicht erzeugen (LDAP erforderlich)',
    { tag: [DEV] },
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
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
        return new PersonDetailsViewPage(page);
      });

      const inbetriebnahmePasswort: string = await test.step('Inbetriebnahme-Passwort erzeugen', async () => {
        return personDetailsView.createInbetriebnahmePasswort();
      });

      await test.step('Passwort in LDAP prüfen', async () => {
        const ldapHelper: TestHelperLdap = new TestHelperLdap(
          process.env.LDAP_URL!,
          process.env.LDAP_ADMIN_USER!,
          process.env.LDAP_ADMIN_PASSWORD!,
        );
        expect(
          await ldapHelper.validateInbetriebnahmePasswortMatches(userInfoLehrer.username, inbetriebnahmePasswort),
        ).toBeTruthy();
      });
    },
  );
});
