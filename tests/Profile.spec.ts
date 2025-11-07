import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { getOrganisationId } from '../base/api/organisationApi';
import {
  createPerson,
  UserInfo,
  addSecondOrganisationToPerson,
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
import { landSH, testschule665Name, testschuleDstNr, testschuleName } from '../base/organisation';
import { typeLandesadmin, typeLehrer, typeSchuladmin } from '../base/rollentypen';
import { email, itslearning, schulportaladmin } from '../base/sp';
import { BROWSER, LONG, SHORT, STAGE, DEV } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
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
import { ProfilePage } from '../pages/ProfileView.page';
import { StartPage } from '../pages/StartView.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
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

    await test.step(`Testdaten löschen via API`, async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }

      if (rolleIds.length > 0) {
        deleteRolleById(rolleIds, page);
        rolleIds = [];
      }
    });

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
    { tag: [LONG, STAGE, DEV, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = landSH;
      const rollenname: string = await generateRolleName();
      const rollenart: RollenArt = typeLandesadmin;

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
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

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
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Persönliche Daten
        await profileView.checkSectionPersoenlicheDaten(vorname, nachname, usernames);
        // Schulzuordnung
        await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.labelSchule1).toHaveText('Schule:');
        await expect(profileView.dataSchule1).toHaveText(organisation);
        await expect(profileView.labelRolle1).toHaveText('Rolle:');
        await expect(profileView.dataRolle1).toHaveText(rollenname);
        await expect(profileView.labelDienststellennummer1).toBeHidden();
        await expect(profileView.dataDienststellennummer1).toBeHidden();
        // Passwort
        await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
        await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.textNo2FA).toHaveText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
        await expect(profileView.button2FAEinrichten).toBeEnabled();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung',
    { tag: [LONG, SHORT, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschuleName;
      const rollenname: string = await generateRolleName();
      const rollenart: RollenArt = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, email)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          nachname,
          vorname,
          idSPs,
          rollenname
        );
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        const startPage: StartPage = await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        await startPage.checkSpIsVisible([email]);
        currentUserIsLandesadministrator = false;
      });

      const profileView: ProfilePage = await test.step(`Profil öffnen`, async () => {
        return await header.goToProfile();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Persönliche Daten
        await profileView.checkSectionPersoenlicheDaten(vorname, nachname, usernames);
        // Schulzuordnung
        await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.labelSchule1).toHaveText('Schule:');
        await expect(profileView.dataSchule1).toHaveText(organisation);
        await expect(profileView.labelRolle1).toHaveText('Rolle:');
        await expect(profileView.dataRolle1).toHaveText(rollenname);
        await expect(profileView.labelDienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.dataDienststellennummer1).toHaveText(testschuleDstNr);
        // Passwort
        await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
        await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.button2FAEinrichten).toBeEnabled();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschuleName;
      const rollenname: string = await generateRolleName();

      await test.step(`Schüler via api anlegen und mit diesem anmelden`, async () => {
        const schuleId: string = await getOrganisationId(page, testschuleName);
        const klasseId: string = await getOrganisationId(page, klasse1Testschule);
        const idSPs: string[] = [await getServiceProviderId(page, 'itslearning')];
        const rolleId: string = await createRolle(page, 'LERN', schuleId, rollenname);
        await addServiceProvidersToRolle(page, rolleId, idSPs);
        const userInfo: UserInfo = await createPerson(page, schuleId, rolleId, nachname, vorname, '', klasseId);
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Persönliche Daten
        await profileView.checkSectionPersoenlicheDaten(vorname, nachname, usernames);
        // Schulzuordnung
        await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.labelSchule1).toHaveText('Schule:');
        await expect(profileView.dataSchule1).toHaveText(organisation);
        await expect(profileView.labelRolle1).toHaveText('Rolle:');
        await expect(profileView.dataRolle1).toHaveText(rollenname);
        await expect(profileView.labelDienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.dataDienststellennummer1).toHaveText(testschuleDstNr);
        // Passwort
        await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
        await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline2FA).toBeHidden();
        await expect(profileView.button2FAEinrichten).toBeHidden();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschuleName;
      const rollenname: string = await generateRolleName();
      const rollenart: RollenArt = typeSchuladmin;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
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
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await header.logout({ logoutViaStartPage: false });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Persönliche Daten
        await profileView.checkSectionPersoenlicheDaten(vorname, nachname, usernames);
        // Schulzuordnung
        await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.labelSchule1).toHaveText('Schule:');
        await expect(profileView.dataSchule1).toHaveText(organisation);
        await expect(profileView.labelRolle1).toHaveText('Rolle:');
        await expect(profileView.dataRolle1).toHaveText(rollenname);
        await expect(profileView.labelDienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.dataDienststellennummer1).toHaveText(testschuleDstNr);
        // Passwort
        await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
        await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.button2FAEinrichten).toBeEnabled();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrkraft mit 2 Schulzuordnungen',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation1: string = testschuleName;
      const organisation2: string = testschule665Name;
      const dienststellenNr2: string = '1111165';
      const rollenname: string = await generateRolleName();
      const rollenart: RollenArt = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, itslearning), await getServiceProviderId(page, email)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation1,
          rollenart,
          nachname,
          vorname,
          idSPs,
          rollenname
        );
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await addSecondOrganisationToPerson(
          page,
          userInfo.personId,
          await getOrganisationId(page, organisation1),
          await getOrganisationId(page, organisation2),
          rolleIds[0]
        );
        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Persönliche Daten
        await profileView.checkSectionPersoenlicheDaten(vorname, nachname, usernames);
        // prüfen, welche von den beiden Schulen zuerst angezeigt wird in der Tabelle
        if ((await profileView.dataSchule1.innerText()) == organisation1) {
          // Schulzuordnung 1
          await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung 1');
          await expect(profileView.labelSchule1).toHaveText('Schule:');
          await expect(profileView.dataSchule1).toHaveText(organisation1);
          await expect(profileView.labelRolle1).toHaveText('Rolle:');
          await expect(profileView.dataRolle1).toHaveText(rollenname);
          await expect(profileView.labelDienststellennummer1).toHaveText('DStNr.:');
          await expect(profileView.dataDienststellennummer1).toHaveText(testschuleDstNr);

          // Schulzuordnung 2
          await expect(profileView.cardHeadlineSchulzuordnung2).toHaveText('Schulzuordnung 2');
          await expect(profileView.labelSchule2).toHaveText('Schule:');
          await expect(profileView.dataSchule2).toHaveText(organisation2);
          await expect(profileView.labelRolle2).toHaveText('Rolle:');
          await expect(profileView.dataRolle2).toHaveText(rollenname);
          await expect(profileView.labelDienststellennummer2).toHaveText('DStNr.:');
          await expect(profileView.dataDienststellennummer2).toHaveText(dienststellenNr2);
          // Passwort
          await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
          await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
          // 2FA
          await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
          await expect(profileView.button2FAEinrichten).toBeEnabled();
        } else {
          // Schulzuordnung 1
          await expect(profileView.cardHeadlineSchulzuordnung2).toHaveText('Schulzuordnung 2');
          await expect(profileView.labelSchule2).toHaveText('Schule:');
          await expect(profileView.dataSchule2).toHaveText(organisation1);
          await expect(profileView.labelRolle2).toHaveText('Rolle:');
          await expect(profileView.dataRolle2).toHaveText(rollenname);
          await expect(profileView.labelDienststellennummer2).toHaveText('DStNr.:');
          await expect(profileView.dataDienststellennummer2).toHaveText(testschuleDstNr);

          // Schulzuordnung 2
          await expect(profileView.cardHeadlineSchulzuordnung1).toHaveText('Schulzuordnung 1');
          await expect(profileView.labelSchule1).toHaveText('Schule:');
          await expect(profileView.dataSchule1).toHaveText(organisation2);
          await expect(profileView.labelRolle1).toHaveText('Rolle:');
          await expect(profileView.dataRolle1).toHaveText(rollenname);
          await expect(profileView.labelDienststellennummer1).toHaveText('DStNr.:');
          await expect(profileView.dataDienststellennummer1).toHaveText(dienststellenNr2);

          // Passwort
          await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
          await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();
          // 2FA
          await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
          await expect(profileView.button2FAEinrichten).toBeEnabled();
        }
        // #TODO: wait for the last request in the test
        // sometimes logout breaks the test because of interrupting requests
        // logoutViaStartPage = true is a workaround
        logoutViaStartPage = true;
      });
    }
  );

  test(
    'Das eigene Profil öffnen als Lehrer, Passwort-Ändern öffnen(Passwortänderung nicht durchführen), und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const organisation: string = testschuleName;
      const rollenart: RollenArt = typeLehrer;

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
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step(`Passwort Ändern öffnen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
        // Passwort
        await expect(profileView.cardHeadlinePasswort).toHaveText('Passwort');
        await expect(profileView.buttonStartPWChangeDialog).toBeEnabled();

        await profileView.buttonStartPWChangeDialog.click();
        await profileView.buttonChangePW.click();
      });

      await test.step(`Status des Benutzernamenfelds prüfen`, async () => {
        await expect(profileView.labelUsername).toHaveText(usernames[0]);
        await expect(profileView.textLoginPrompt).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
        await expect(profileView.inputPassword).toBeEnabled();
        await page.goBack();
        await expect(profileView.cardHeadlinePasswort).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Das eigene Profil öffnen, 2FA Einrichten öffnen und Einrichtung soweit möglich',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const organisation: string = testschuleName;
      const rollenart: RollenArt = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, email)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation,
          rollenart,
          await generateNachname(),
          await generateVorname(),
          idSPs,
          await generateRolleName()
        );
        rolleIds.push(userInfo.rolleId);
        usernames.push(userInfo.username);

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.goToProfile();
      });

      await test.step(`2FA öffnen`, async () => {
        await expect(profileView.buttonZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');

        await expect(profileView.cardHeadline2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.textNo2FA).toBeVisible();
        await expect(profileView.button2FAEinrichten).toHaveText('2FA einrichten');
        await expect(profileView.button2FAEinrichten).toBeEnabled();

        profileView.button2FAEinrichten.click();
      });

      await test.step(`2FA Texte prüfen und QR-Code generieren`, async () => {
        await expect(profileView.textLayoutCardHeadline).toHaveText('2FA einrichten');
        await expect(profileView.text2FASelfServiceInfo).toHaveText(
          'Im Folgenden wird ein QR-Code generiert, mit dem Sie auf Ihrem Endgerät eine Zwei-Faktor-Authentifizierung einrichten können.'
        );
        await expect(profileView.text2FASelfServiceWarning).toHaveText(
          'Bitte stellen Sie vor dem Fortfahren sicher, dass eine entsprechende App auf Ihrem Endgerät installiert ist. Für Ihr Lehrkräfte-Endgerät finden Sie entsprechend genehmigte Anwendungen im Software-Hub.'
        );
        await expect(profileView.button2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button2FAAbbrechen).toHaveText('Abbrechen');
        profileView.button2FAWeiter.click();
      });

      await test.step(`QR-Code-Display prüfen`, async () => {
        await expect(profileView.textLayoutCardHeadline).toHaveText('Software-Token einrichten');
        await expect(profileView.text2FASelfServiceQRInfo).toHaveText(
          'Bitte scannen Sie den QR-Code mit Ihrer 2FA-App (z.B. FreeOTP).'
        );
        await expect(profileView.data2FAQRCode).toBeVisible();
        await expect(profileView.button2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Einrichtung abschließen`, async () => {
        await profileView.button2FAWeiter.click();

        await expect(profileView.textLayoutCardHeadline).toHaveText('Zwei-Faktor-Authentifizierung (2FA)');
        await expect(profileView.textOTPEntryInfo).toHaveText(
          'Bitte geben Sie das angezeigte Einmalpasswort ein, um die Einrichtung abzuschließen.'
        );
        await expect(profileView.text2FASelfServiceError).toHaveText('Einmalpasswort');
        await expect(profileView.textOTPInput).toBeVisible();

        await expect(profileView.button2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Fehlertext prüfen`, async () => {
        await profileView.button2FAWeiter.click();
        await expect(profileView.textOTPEntryError).toHaveText('Das Einmalpasswort muss angegeben werden.');

        await expect(profileView.button2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Dialog schließen`, async () => {
        await profileView.button2FAAbbrechen.click();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Im Profil das eigene Passwort ändern als Lehrer und Schüler (Schüler meldet sich anschließend mit dem neuen PW an)',
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const loginView: LoginPage = new LoginPage(page);
      let userInfoLehrer: UserInfo;
      let userInfoSchueler: UserInfo;

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
        rolleIds.push(userInfoLehrer.rolleId);
        usernames.push(userInfoLehrer.username);

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
        rolleIds.push(userInfoSchueler.rolleId);
        usernames.push(userInfoSchueler.username);
      });

      await test.step(`Mit dem Lehrer am Portal anmelden`, async () => {
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        await loginView.login(userInfoLehrer.username, userInfoLehrer.password);
        currentUserIsLandesadministrator = false;
        userInfoLehrer.password = await loginView.updatePW();
      });

      const profileView: ProfilePage = await header.goToProfile();

      await test.step(`Passwortänderung Lehrer durchführen`, async () => {
        await profileView.buttonStartPWChangeDialog.click();
        await profileView.buttonChangePW.click();
        await loginView.loginCurrentUser(userInfoLehrer.username, userInfoLehrer.password);
        await loginView.updatePW(true);
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
      });

      await test.step(`Mit dem Schüler am Portal anmelden`, async () => {
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        await loginView.login(userInfoSchueler.username, userInfoSchueler.password);
        userInfoSchueler.password = await loginView.updatePW();
      });

      await test.step(`Passwortänderung Schüler durchführen`, async () => {
        await header.goToProfile();
        await profileView.buttonStartPWChangeDialog.click();
        await profileView.buttonChangePW.click();
        await loginView.loginCurrentUser(userInfoSchueler.username, userInfoSchueler.password);
        userInfoSchueler.password = await loginView.updatePW(true);
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
      });

      await test.step(`Schüler meldet sich mit dem neuen Passwort am Portal an`, async () => {
        await header.logout({ logoutViaStartPage: true });
        await header.goToLogin();
        const startView: StartPage = await loginView.login(userInfoSchueler.username, userInfoSchueler.password);
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
    { tag: [LONG, STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen und mit diesem anmelden`, async () => {
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
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);

        await header.logout({ logoutViaStartPage: true });
        await header.buttonLogin.click();
        const login: LoginPage = new LoginPage(page);
        await login.login(userInfoLehrer.username, userInfoLehrer.password);
        await login.updatePW();
        currentUserIsLandesadministrator = false;
      });

      const profileView: ProfilePage = new ProfilePage(page);

      await test.step(`Profil öffnen`, async () => {
        await header.buttonProfil.click();
        await expect(profileView.titleMeinProfil).toHaveText('Mein Profil');
      });

      await test.step(`Inbetriebnahme-Passwort für LK-Endgerät erzeugen`, async () => {
        // Section Inbetriebnahme-Passwort für LK-Endgerät
        await expect(profileView.cardHeadlinePasswordLKEndgeraet).toBeVisible();
        await expect(profileView.infoTextSectionPasswordLKEndgeraet).toBeVisible();
        await profileView.buttonCreatePasswordSectionLKEndgeraet.click();

        // Dialog Inbetriebnahme-Passwort für LK-Endgeräte
        await expect(profileView.passwordResetDialogHeadline).toHaveText('Inbetriebnahme-Passwort erzeugen');
        await expect(profileView.infoTextDialogPasswordLKEndgeraet).toHaveText(
          'Bitte notieren Sie sich das Passwort oder drucken Sie es aus. Nach dem Schließen des Dialogs wird das Passwort' +
            ' nicht mehr angezeigt. Sie benötigen dieses Passwort ausschließlich zur erstmaligen Anmeldung an Ihrem neuen LK-Endgerät.'
        );
        await profileView.buttonCreatePasswordDialogLKEndgeraet.click();

        // Dialog Inbetriebnahme-Passwort erzeugen
        await profileView.validatePasswordResetDialog();
        await expect(profileView.titleMeinProfil).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
