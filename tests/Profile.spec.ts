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
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/components/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { PersoenlicheDaten, ProfileViewPage, Zuordnung } from '../pages/ProfileView.neu.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Offene Dialoge schließen`, async () => {
      page.keyboard.press('Escape');
    });

    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
      await landing.buttonAnmelden.click();
      await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
    }

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

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

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        currentUserIsLandesadministrator = false;
        await login.updatePW();
      });

      await test.step(`Profil öffnen`, async () => {
        const startView: StartPage = new StartPage(page);
        await startView.checkSpIsVisible([schulportaladmin]);
        await header.goToProfile();
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
      logoutViaStartPage = true;
  });

test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung',
  { tag: [LONG, SHORT, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
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

      await header.logout({ logoutViaStartPage: true });
      await header.buttonLogin.click();

      const startPage: StartPage = await login.login(userInfo.username, userInfo.password);
      await login.updatePW();

      await startPage.checkSpIsVisible([email]);
      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.goToProfile();
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

    logoutViaStartPage = true;
  }
);


test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const organisation: string = testschuleName;
    const rollenname: string = await generateRolleName();
    const rollenart: RollenArt = 'LERN';
    let username: string = '';

    // Setup: Schüler via API anlegen & anmelden
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

      await header.logout({ logoutViaStartPage: true });
      await header.buttonLogin.click();
      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();

      currentUserIsLandesadministrator = false;
    });

    // Navigation: Profil öffnen
    await test.step('Profil öffnen', async () => {
      await header.goToProfile();
      await profileView.waitForPageLoad();
    });

    // 🧪 Assertions: Profil auf Vollständigkeit prüfen
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

    logoutViaStartPage = true;
  }
);

  test(
  'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
    const profileView: ProfileViewPage = new ProfileViewPage(page);

    const vorname: string = await generateVorname();
    const nachname: string = await generateNachname();
    const organisation: string = testschuleName;
    const rollenname: string = await generateRolleName();
    const rollenart: RollenArt = typeSchuladmin;
    let username: string = '';

    // 🧩 Setup: Schuladmin via API anlegen & anmelden
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

      await header.logout({ logoutViaStartPage: false });
      await header.buttonLogin.click();

      await login.login(userInfo.username, userInfo.password);
      await login.updatePW();

      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.goToProfile();
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

    logoutViaStartPage = true;
  }
);


  test(
    'Das eigene Profil öffnen als Lehrer, Passwort-Ändern öffnen (Passwortänderung nicht durchführen), und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);
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

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();

        currentUserIsLandesadministrator = false;
      });

      await test.step('Profil öffnen', async () => {
        await header.goToProfile();
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

      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen als Lehrer, Passwort-Ändern öffnen(Passwortänderung nicht durchführen), und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

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

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step('Passwort ändern öffnen', async () => {
        await profileView.openChangePasswordDialog();
      });

      await test.step('Status des Benutzernamenfelds prüfen', async () => {
        await profileView.assertPasswordDialogState(username);
        await profileView.navigateBackToProfile();
      });

      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

test(
  'Das eigene Profil öffnen, 2FA Einrichten öffnen und Einrichtung soweit möglich',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
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

      await header.logout({ logoutViaStartPage: true });
      await header.buttonLogin.click();
      await login.login(username, userInfo.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.goToProfile();
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

    logoutViaStartPage = true;
  }
 );

  test(
    'Im Profil das eigene Passwort ändern als Lehrer und Schüler (Schüler meldet sich anschließend mit dem neuen PW an)',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const loginView: LoginPage = new LoginPage(page);
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
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        await loginView.login(userInfoLehrer.username, userInfoLehrer.password);
        currentUserIsLandesadministrator = false;
        userInfoLehrer.password = await loginView.updatePW();
      });

      const profileView: ProfileViewPage = await header.goToProfile();

      await test.step('Passwortänderung Lehrer durchführen', async () => {
        await profileView.changePassword(userInfoLehrer.username, userInfoLehrer.password);
      });

      await test.step(`Mit dem Schüler am Portal anmelden`, async () => {
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        await loginView.login(userInfoSchueler.username, userInfoSchueler.password);
        userInfoSchueler.password = await loginView.updatePW();
      });

      await test.step(`Passwortänderung Schüler durchführen`, async () => {
        await header.goToProfile();
         newPassword = await profileView.changePassword(userInfoSchueler.username, userInfoSchueler.password);
      });

      await test.step(`Schüler meldet sich mit dem neuen Passwort am Portal an`, async () => {
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        const startView: StartPage = await loginView.login(userInfoSchueler.username, newPassword);
        await startView.checkSpIsVisible([itslearning]);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

test(
  'Inbetriebnahme-Passwort als Lehrer über das eigene Profil erzeugen',
  { tag: [LONG, STAGE] },
  async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
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

      await header.logout({ logoutViaStartPage: true });
      await header.buttonLogin.click();
      await login.login(userInfoLehrer.username, userInfoLehrer.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
    });

    await test.step('Profil öffnen', async () => {
      await header.goToProfile();
      await profileView.waitForPageLoad();
    });

    await test.step('Inbetriebnahme-Passwort für LK-Endgerät erzeugen', async () => {
      await profileView.resetDevicePassword();
    });

    logoutViaStartPage = true;
  }
);
});
