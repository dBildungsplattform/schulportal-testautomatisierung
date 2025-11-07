import { PlaywrightTestArgs, test } from '@playwright/test';
import { createRolleAndPersonWithUserContext, UserInfo } from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { testschuleName } from '../../base/organisation';
import { RollenArt, typeLehrer } from '../../base/rollentypen';
import { email } from '../../base/sp';
import { LONG, STAGE } from '../../base/tags';
import {
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../../base/utils/generateTestdata';
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
    'Das eigene Profil öffnen, 2FA Einrichten öffnen und Einrichtung soweit möglich',
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
        const idSPs: string[] = [await getServiceProviderId(page, email)];
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
        await login.login(username, userInfo.password);
        await login.updatePassword();
        currentUserIsLandesadministrator = false;
      });

      await test.step('Profil öffnen', async () => {
        await header.navigateToProfile();
        await profileView.waitForPageLoad();
      });

      await test.step('2FA öffnen', async () => {
        await profileView.open2FADialog();
      });

      await test.step('2FA Texte prüfen und QR-Code generieren', async () => {
        await profileView.assert2FADialogIntro();
        await profileView.proceedTo2FAQrCode();
      });

      await test.step('QR-Code-Display prüfen', async () => {
        await profileView.assert2FAQrCodeDisplayed();
        await profileView.proceedToOtpEntry();
      });

      await test.step('OTP-Dialog prüfen und Fehler anzeigen', async () => {
        await profileView.assert2FAOtpEntryPrompt();
        await profileView.submitEmptyOtpAndCheckError();
      });

      await test.step('Dialog schließen', async () => {
        await profileView.close2FADialog();
        await profileView.assert2FACard();
      });
    }
  );
});
