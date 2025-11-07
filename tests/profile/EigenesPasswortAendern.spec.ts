import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../../base/api/organisationApi';
import { createPerson, createRolleAndPersonWithUserContext, UserInfo } from '../../base/api/personApi';
import { addServiceProvidersToRolle, createRolle } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { klasse1Testschule } from '../../base/klassen';
import { testschuleName } from '../../base/organisation';
import { RollenArt, typeLehrer } from '../../base/rollentypen';
import { email, itslearning } from '../../base/sp';
import { LONG, STAGE } from '../../base/tags';
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
        .then((login: LoginViewPage) => login.login())
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
    'Im Profil das eigene Passwort ändern als Lehrer und Schüler (Schüler meldet sich anschließend mit dem neuen PW an)',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const loginView: LoginViewPage = new LoginViewPage(page);
      let userInfoLehrer: UserInfo;
      let userInfoSchueler: UserInfo;
      let newPassword: string = '';

      await test.step(`Lehrer und Schüler via api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getServiceProviderId(page, email)],
          await generateRolleName(),
          await generateKopersNr()
        );

        const schuleId: string = await getOrganisationId(page, testschuleName);
        const klasseId: string = await getOrganisationId(page, klasse1Testschule);
        const idSPs: string[] = [await getServiceProviderId(page, 'itslearning')];
        const rolleId: string = await createRolle(page, 'LERN', schuleId, await generateRolleName());
        await addServiceProvidersToRolle(page, rolleId, idSPs);
        userInfoSchueler = await createPerson(
          page,
          schuleId,
          rolleId,
          await generateNachname(),
          await generateVorname(),
          '',
          klasseId
        );
      });

      await test.step(`Mit dem Lehrer am Portal anmelden`, async () => {
        await header.logout();
        await header.navigateToLogin();
        await loginView.login(userInfoLehrer.username, userInfoLehrer.password);
        currentUserIsLandesadministrator = false;
        userInfoLehrer.password = await loginView.updatePassword();
      });

      const profileView: ProfileViewPage = await header.navigateToProfile();

      await test.step('Passwortänderung Lehrer durchführen', async () => {
        await profileView.changePassword(userInfoLehrer.username, userInfoLehrer.password);
      });

      await test.step(`Mit dem Schüler am Portal anmelden`, async () => {
        await header.logout();
        await header.navigateToLogin();
        await loginView.login(userInfoSchueler.username, userInfoSchueler.password);
        userInfoSchueler.password = await loginView.updatePassword();
      });

      await test.step(`Passwortänderung Schüler durchführen`, async () => {
        await header.navigateToProfile();
        newPassword = await profileView.changePassword(userInfoSchueler.username, userInfoSchueler.password);
      });

      await test.step(`Schüler meldet sich mit dem neuen Passwort am Portal an`, async () => {
        await header.logout();
        await header.navigateToLogin();
        const startView: StartViewPage = await loginView.login(userInfoSchueler.username, newPassword);
        await startView.serviceProviderIsVisible([itslearning]);
      });
    }
  );

  test(
    'Das eigene Profil öffnen als Lehrer, Passwort-Ändern öffnen (Passwortänderung nicht durchführen), und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const profileView: ProfileViewPage = new ProfileViewPage(page);

      const organisation: string = testschuleName;
      const rollenart: RollenArt = typeLehrer;
      let username: string = '';
      const kopersnummer: string = await generateKopersNr();

      await test.step('Lehrer via API anlegen und mit diesem anmelden', async () => {
        const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          await generateNachname(),
          await generateVorname(),
          idSPs,
          await generateRolleName(),
          kopersnummer
        );

        username = userInfo.username;

        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePassword();

        currentUserIsLandesadministrator = false;
      });

      await test.step('Profil öffnen', async () => {
        await header.navigateToProfile();
        await profileView.waitForPageLoad();
      });

      await test.step('Passwort ändern öffnen', async () => {
        await profileView.assertPasswordCard();
        await profileView.openChangePasswordDialog();
      });

      await test.step('Status des Benutzernamenfelds prüfen', async () => {
        await profileView.assertPasswordDialogUsernamePrompt(username);
        await profileView.navigateBackToProfile();
        await profileView.assertPasswordCardVisible();
      });
    }
  );
});
