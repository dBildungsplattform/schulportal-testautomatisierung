import { PlaywrightTestArgs, test } from '@playwright/test';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { testschuleName } from '../../base/organisation';
import { typeLehrer } from '../../base/rollentypen';
import { email } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { ProfileViewPage } from '../../pages/ProfileView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
       await FromAnywhere(page)
        .start()
        .then((landing: LandingViewPage) => landing.navigateToLogin())
        .then((login: LoginViewPage) => login.login(ADMIN, PW))
        .then((startseite: StartViewPage) => startseite.serviceProvidersAreLoaded());
    });
  });

    test.afterEach(async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingViewPage = new LandingViewPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const startseite: StartViewPage = new StartViewPage(page);

      // Always: Close open dialogs if present
      await test.step('Offene Dialoge schließen', async () => {
        try {
          await page.keyboard.press('Escape');
        } catch {
          // ignore if no dialog open
        }
      });

      // If not logged in as Landesadministrator, reset to admin session
      if (!currentUserIsLandesadministrator) {
        await test.step('Zurück zum Admin wechseln', async () => {
          await header.logout();
          await landing.navigateToLogin();
          await login.login(ADMIN, PW);
          await startseite.serviceProvidersAreLoaded();
        });
      }

      // Final cleanup: ensure logged out (safety net)
      await test.step('Endgültig abmelden', async () => {
        try {
          await header.logout();
        } catch {
          // ignore if already logged out
        }
      });
    });


test(
  'Inbetriebnahme-Passwort als Lehrer über das eigene Profil erzeugen',
  { tag: [STAGE, DEV] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);
    let userInfoLehrer: UserInfo;

    await test.step('Testdaten: Lehrer mit einer Rolle (LEHR) über die API anlegen und mit diesem anmelden', async () => {
      userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
        page,
        testschuleName,
        typeLehrer,
        await generateNachname(),
        await generateVorname(),
        [await getServiceProviderId(page, email)],
        await generateRolleName(),
        await generateKopersNr()
      );

      await header.logout();
      await header.navigateToLogin();
      await login.login(userInfoLehrer.username, userInfoLehrer.password);
      await login.updatePassword();
      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.navigateToProfile();
      await profileView.waitForPageLoad();
    });

    await test.step('Inbetriebnahme-Passwort für LK-Endgerät erzeugen', async () => {
      await profileView.resetDevicePassword();
    });
  }
);
});
