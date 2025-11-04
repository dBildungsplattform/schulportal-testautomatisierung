import { PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../base/api/organisationApi';
import {
  createPerson,
  UserInfo,
  createRolleAndPersonWithUserContext,
} from '../base/api/personApi';
import { addServiceProvidersToRolle, addSystemrechtToRolle, createRolle, RollenArt } from '../base/api/rolleApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import {
  klassenVerwalten,
  personenAnlegen,
  personenSofortLoeschen,
  personenVerwalten,
  rollenVerwalten,
  schulenVerwalten,
  schultraegerVerwalten,
} from '../base/berechtigungen';
import { klasse1Testschule } from '../base/klassen';
import { landSH, testschuleDstNr, testschuleName } from '../base/organisation';
import { typeLandesadmin, typeLehrer, typeSchuladmin } from '../base/rollentypen';
import { email, itslearning, schulportaladmin } from '../base/sp';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import {
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/utils/generateTestdata';
import { PersoenlicheDaten, ProfileViewPage, Zuordnung } from '../pages/ProfileView.neu.page';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';
import { LandingViewPage } from '../pages/LandingView.neu.page';
import { HeaderPage } from '../pages/components/Header.neu.page';
import FromAnywhereNeu from '../pages/FromAnywhere.neu';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
       await FromAnywhereNeu(page)
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
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginViewPage = new LoginViewPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = landSH;
      const rollenname: string = await generateRolleName();
      const rollenart: RollenArt = typeLandesadmin;
      let username: string = '';

      await test.step(`Landesadmin via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          nachname,
          vorname,
          idSPs,
          rollenname
        );

        username = userInfo.username;

        await addSystemrechtToRolle(page, userInfo.rolleId, rollenVerwalten);
        await addSystemrechtToRolle(page, userInfo.rolleId, personenSofortLoeschen);
        await addSystemrechtToRolle(page, userInfo.rolleId, personenVerwalten);
        await addSystemrechtToRolle(page, userInfo.rolleId, schulenVerwalten);
        await addSystemrechtToRolle(page, userInfo.rolleId, klassenVerwalten);
        await addSystemrechtToRolle(page, userInfo.rolleId, schultraegerVerwalten);
        await addSystemrechtToRolle(page, userInfo.rolleId, personenAnlegen);

        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfo.username, userInfo.password);
        currentUserIsLandesadministrator = false;
        await login.updatePassword();
      });

      await test.step(`Profil öffnen`, async () => {
        const startView: StartViewPage = new StartViewPage(page);
        await startView.serviceProviderIsVisible([schulportaladmin]);
        await header.navigateToProfile();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {

        const personalData: PersoenlicheDaten = {
          vorname: vorname,
          nachname: nachname,
          username: username,
          rollenart: rollenart
        };

        const zuordnungen: Zuordnung[] = [
          {
            dienststellennummer: testschuleDstNr,
            organisationsname: organisation,
            rollenart: rollenart,
            rollenname: rollenname
          }
        ];

        await profileView.waitForPageLoad();
        await profileView.assertPersonalData(personalData);
        await profileView.assertZuordnungen(zuordnungen);
        await profileView.assertPasswordCard();
        await profileView.assert2FACard();
      });
  });

test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung',
  { tag: [LONG, SHORT, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const organisation: string = testschuleName;
    const rollenname: string = await generateRolleName();
    const rollenart: RollenArt = typeLehrer;
    let username: string = '';
    const kopersnummer: string = await generateKopersNr();

    // Setup: Lehrer anlegen & anmelden
    await test.step('Lehrer via API anlegen und mit diesem anmelden', async () => {
      const idSPs: string[] = [await getServiceProviderId(page, email)];

      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
        page,
        organisation,
        rollenart,
        nachname,
        vorname,
        idSPs,
        rollenname,
        kopersnummer
      );

      username = userInfo.username;

      await header.logout();
      await header.navigateToLogin();

      const startPage: StartViewPage = await login.login(userInfo.username, userInfo.password);
      await login.updatePassword();

      await startPage.serviceProviderIsVisible([email]);
      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.navigateToProfile();
      await profileView.waitForPageLoad();
    });

    await test.step('Profil auf Vollständigkeit prüfen', async () => {
      const personalData: PersoenlicheDaten = {
        vorname,
        nachname,
        username,
        rollenart,
      };

      const zuordnungen: Zuordnung[] = [
        {
          dienststellennummer: testschuleDstNr,
          organisationsname: organisation,
          rollenart,
          rollenname,
        },
      ];

      await profileView.assertPersonalData(personalData);
      await profileView.assertZuordnungen(zuordnungen);
      await profileView.assertPasswordCard();
      await profileView.assert2FACard();
    });
  }
);


test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const organisation: string = testschuleName;
    const rollenname: string = await generateRolleName();
    const rollenart: RollenArt = 'LERN';
    let username: string = '';

    await test.step('Schüler via API anlegen und mit diesem anmelden', async () => {
      const schuleId: string = await getOrganisationId(page, testschuleName);
      const klasseId: string = await getOrganisationId(page, klasse1Testschule);
      const idSPs: string[] = [await getServiceProviderId(page, 'itslearning')];

      const rolleId: string = await createRolle(page, rollenart, schuleId, rollenname);
      await addServiceProvidersToRolle(page, rolleId, idSPs);

      const userInfo: UserInfo = await createPerson(
        page,
        schuleId,
        rolleId,
        nachname,
        vorname,
        '',
        klasseId
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

    await test.step('Profil auf Vollständigkeit prüfen', async () => {
      const personalData: PersoenlicheDaten = {
        vorname,
        nachname,
        username,
        rollenart,
      };

      const zuordnungen: Zuordnung[] = [
        {
          dienststellennummer: testschuleDstNr,
          organisationsname: organisation,
          rollenart,
          rollenname,
        },
      ];

      await profileView.assertPersonalData(personalData);
      await profileView.assertZuordnungen(zuordnungen);

      await profileView.assertPasswordCard();
      // Schüler has no visible 2FA section
      await profileView.assertNo2FACard();
    });
  }
);

  test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const organisation: string = testschuleName;
    const rollenname: string = await generateRolleName();
    const rollenart: RollenArt = typeSchuladmin;
    let username: string = '';

    // Setup: Schuladmin via API anlegen & anmelden
    await test.step('Schuladmin via API anlegen und mit diesem anmelden', async () => {
      const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
        page,
        organisation,
        rollenart,
        nachname,
        vorname,
        idSPs,
        rollenname
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

    await test.step('Profil auf Vollständigkeit prüfen', async () => {
      const personalData: PersoenlicheDaten = {
        vorname,
        nachname,
        username,
        rollenart,
      };

      const zuordnungen: Zuordnung[] = [
        {
          dienststellennummer: testschuleDstNr,
          organisationsname: organisation,
          rollenart,
          rollenname,
        },
      ];

      await profileView.assertPersonalData(personalData);
      await profileView.assertZuordnungen(zuordnungen);
      await profileView.assertPasswordCard();
      await profileView.assert2FACard(); // Schuladmin *has* 2FA card
    });
  }
);

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

  test(
    'Das eigene Profil öffnen als Lehrer, Passwort-Ändern öffnen(Passwortänderung nicht durchführen), und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginViewPage = new LoginViewPage(page);

      const organisation: string = testschuleName;
      const rollenart: RollenArt = typeLehrer;
      let username: string = '';

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          await generateNachname(),
          await generateVorname(),
          idSPs,
          await generateRolleName()
        );
        username = userInfo.username;

        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePassword();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.navigateToProfile();
      });

      await test.step('Passwort ändern öffnen', async () => {
        await profileView.openChangePasswordDialog();
      });

      await test.step('Status des Benutzernamenfelds prüfen', async () => {
        await profileView.assertPasswordDialogState(username);
        await profileView.navigateBackToProfile();
      });
    }
  );

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

test(
  'Inbetriebnahme-Passwort als Lehrer über das eigene Profil erzeugen',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginViewPage = new LoginViewPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);
    let userInfoLehrer: UserInfo;

    await test.step('Testdaten: Lehrer mit einer Rolle (LEHR) über die API anlegen und mit diesem anmelden', async () => {
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
