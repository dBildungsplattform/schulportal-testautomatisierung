import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page';
import { getOrganisationId } from '../base/api/testHelperOrganisation.page';
import { addSecondOrganisationToPerson, createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { addSystemrechtToRolle } from '../base/api/testHelperRolle.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { landSH, testschule, testschule665 } from '../base/organisation.ts';
import { typeLandesadmin, typeLehrer, typeSchueler, typeSchuladmin } from '../base/rollentypen.ts';
import { email, itslearning } from '../base/sp.ts';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { generateNachname, generateRolleName, generateVorname } from '../base/testHelperGenerateTestdataNames.ts';
import { HeaderPage } from '../pages/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { ProfilePage } from '../pages/ProfileView.page';
import { StartPage } from '../pages/StartView.page';
import FromAnywhere from '../pages/FromAnywhere'

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const startPage = await FromAnywhere(page)
        .start()
        .then((landing) => landing.goToLogin())
        .then((login) => login.login())
        .then((startseite) => startseite.checkHeadlineIsVisible());
  
      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Offene Dialoge schließen`, async () => {
      page.keyboard.press('Escape');
    });

    if(!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.checkHeadlineIsVisible();
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
      await header.logout();
    });
  });

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = landSH;
      const rollenname: string = await generateRolleName();
      const rollenart: string = typeLandesadmin;

      await test.step(`Landesadmin via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
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

        await addSystemrechtToRolle(page, userInfo.rolleId, 'ROLLEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'KLASSEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULTRAEGER_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        currentUserIsLandesadministrator = false;
        await login.UpdatePW();
      });

      await test.step(`Profil öffnen`, async () => {
        await expect(startseite.cardItemSchulportalAdministration).toBeVisible();
        await header.button_profil.click();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Persönliche Daten
        await expect(profileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
        await expect(profileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
        await expect(profileView.data_VornameNachname).toHaveText(vorname + ' ' + nachname);
        await expect(profileView.label_Benutzername).toHaveText('Benutzername:');
        await expect(profileView.data_Benutzername).toHaveText(usernames[0]);
        await expect(profileView.label_KopersNr).toBeHidden();
        await expect(profileView.data_KopersNr).toBeHidden();
        await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();
        // Schulzuordnung
        await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.label_Schule1).toHaveText('Schule:');
        await expect(profileView.data_Schule1).toHaveText(organisation);
        await expect(profileView.label_Rolle1).toHaveText('Rolle:');
        await expect(profileView.data_Rolle1).toHaveText(rollenname);
        await expect(profileView.label_Dienststellennummer1).toBeHidden();
        await expect(profileView.data_Dienststellennummer1).toBeHidden();
        // Passwort
        await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
        await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.text_no2FA).toHaveText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
        await expect(profileView.button_2FAEinrichten).toBeEnabled();
      });
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschule;
      const dienststellenNr: string = '1111111';
      const rollenname: string = await generateRolleName();
      const rollenart: string = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'E-Mail')];
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

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Persönliche Daten
        await expect(profileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
        await expect(profileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
        await expect(profileView.data_VornameNachname).toHaveText(vorname + ' ' + nachname);
        await expect(profileView.label_Benutzername).toHaveText('Benutzername:');
        await expect(profileView.data_Benutzername).toHaveText(usernames[0]);
        await expect(profileView.label_KopersNr).toBeHidden();
        await expect(profileView.data_KopersNr).toBeHidden();
        await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();
        // Schulzuordnung
        await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.label_Schule1).toHaveText('Schule:');
        await expect(profileView.data_Schule1).toHaveText(organisation);
        await expect(profileView.label_Rolle1).toHaveText('Rolle:');
        await expect(profileView.data_Rolle1).toHaveText(rollenname);
        await expect(profileView.label_Dienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.data_Dienststellennummer1).toHaveText(dienststellenNr);
        // Passwort
        await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
        await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.button_2FAEinrichten).toBeEnabled();
      });
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschule;
      const dienststellenNr: string = '1111111';
      const rollenname: string = await generateRolleName();
      const rollenart: string = typeSchueler;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'itslearning')];
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

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Persönliche Daten
        await expect(profileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
        await expect(profileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
        await expect(profileView.data_VornameNachname).toHaveText(vorname + ' ' + nachname);
        await expect(profileView.label_Benutzername).toHaveText('Benutzername:');
        await expect(profileView.data_Benutzername).toHaveText(usernames[0]);
        await expect(profileView.label_KopersNr).toBeHidden();
        await expect(profileView.data_KopersNr).toBeHidden();
        await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();
        // Schulzuordnung
        await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.label_Schule1).toHaveText('Schule:');
        await expect(profileView.data_Schule1).toHaveText(organisation);
        await expect(profileView.label_Rolle1).toHaveText('Rolle:');
        await expect(profileView.data_Rolle1).toHaveText(rollenname);
        await expect(profileView.label_Dienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.data_Dienststellennummer1).toHaveText(dienststellenNr);
        // Passwort
        await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
        await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline_2FA).toBeHidden();
        await expect(profileView.button_2FAEinrichten).toBeHidden();
      });
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation: string = testschule;
      const dienststellenNr: string = '1111111';
      const rollenname: string = await generateRolleName();
      const rollenart: string = typeSchuladmin;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
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

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Persönliche Daten
        await expect(profileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
        await expect(profileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
        await expect(profileView.data_VornameNachname).toHaveText(vorname + ' ' + nachname);
        await expect(profileView.label_Benutzername).toHaveText('Benutzername:');
        await expect(profileView.data_Benutzername).toHaveText(usernames[0]);
        await expect(profileView.label_KopersNr).toBeHidden();
        await expect(profileView.data_KopersNr).toBeHidden();
        await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();
        // Schulzuordnung
        await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
        await expect(profileView.label_Schule1).toHaveText('Schule:');
        await expect(profileView.data_Schule1).toHaveText(organisation);
        await expect(profileView.label_Rolle1).toHaveText('Rolle:');
        await expect(profileView.data_Rolle1).toHaveText(rollenname);
        await expect(profileView.label_Dienststellennummer1).toHaveText('DStNr.:');
        await expect(profileView.data_Dienststellennummer1).toHaveText(dienststellenNr);
        // Passwort
        await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
        await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
        // 2FA
        await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.button_2FAEinrichten).toBeEnabled();
      });
    }
  );

  test(
    'Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrkraft mit 2 Schulzuordnungen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const vorname: string = await generateVorname();
      const nachname: string = await generateNachname();
      const organisation1: string = testschule;
      const organisation2: string = testschule665;
      const dienststellenNr1: string = '1111111';
      const dienststellenNr2: string = '1111165';
      const rollenname: string = await generateRolleName();
      const rollenart: string = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, itslearning), await getSPId(page, email)];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
          page,
          organisation1,
          rollenart,
          nachname,
          vorname,
          idSPs,
          rollenname,
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
        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`Profil auf Vollständigkeit prüfen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Persönliche Daten
        await expect(profileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
        await expect(profileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
        await expect(profileView.data_VornameNachname).toHaveText(vorname + ' ' + nachname);
        await expect(profileView.label_Benutzername).toHaveText('Benutzername:');
        await expect(profileView.data_Benutzername).toHaveText(usernames[0]);
        await expect(profileView.label_KopersNr).toBeHidden();
        await expect(profileView.data_KopersNr).toBeHidden();
        await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();

        // prüfen, welche von den beiden Schulen zuerst angezeigt wird in der Tabelle
        if ((await profileView.data_Schule1.innerText()) == organisation1) {
          // Schulzuordnung 1
          await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung 1');
          await expect(profileView.label_Schule1).toHaveText('Schule:');
          await expect(profileView.data_Schule1).toHaveText(organisation1);
          await expect(profileView.label_Rolle1).toHaveText('Rolle:');
          await expect(profileView.data_Rolle1).toHaveText(rollenname);
          await expect(profileView.label_Dienststellennummer1).toHaveText('DStNr.:');
          await expect(profileView.data_Dienststellennummer1).toHaveText(dienststellenNr1);

          // Schulzuordnung 2
          await expect(profileView.cardHeadline_Schulzuordnung2).toHaveText('Schulzuordnung 2');
          await expect(profileView.label_Schule2).toHaveText('Schule:');
          await expect(profileView.data_Schule2).toHaveText(organisation2);
          await expect(profileView.label_Rolle2).toHaveText('Rolle:');
          await expect(profileView.data_Rolle2).toHaveText(rollenname);
          await expect(profileView.label_Dienststellennummer2).toHaveText('DStNr.:');
          await expect(profileView.data_Dienststellennummer2).toHaveText(dienststellenNr2);
          // Passwort
          await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
          await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
          // 2FA
          await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
          await expect(profileView.button_2FAEinrichten).toBeEnabled();
        } else {
          // Schulzuordnung 1
          await expect(profileView.cardHeadline_Schulzuordnung2).toHaveText('Schulzuordnung 2');
          await expect(profileView.label_Schule2).toHaveText('Schule:');
          await expect(profileView.data_Schule2).toHaveText(organisation1);
          await expect(profileView.label_Rolle2).toHaveText('Rolle:');
          await expect(profileView.data_Rolle2).toHaveText(rollenname);
          await expect(profileView.label_Dienststellennummer2).toHaveText('DStNr.:');
          await expect(profileView.data_Dienststellennummer2).toHaveText(dienststellenNr1);

          // Schulzuordnung 2
          await expect(profileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung 1');
          await expect(profileView.label_Schule1).toHaveText('Schule:');
          await expect(profileView.data_Schule1).toHaveText(organisation2);
          await expect(profileView.label_Rolle1).toHaveText('Rolle:');
          await expect(profileView.data_Rolle1).toHaveText(rollenname);
          await expect(profileView.label_Dienststellennummer1).toHaveText('DStNr.:');
          await expect(profileView.data_Dienststellennummer1).toHaveText(dienststellenNr2);

          // Passwort
          await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
          await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();
          // 2FA
          await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
          await expect(profileView.button_2FAEinrichten).toBeEnabled();
        }
      });
    }
  );

  test(
    'Das eigene Profil öffnen, Passwort Ändern öffnen, und Status des Benutzernamenfelds prüfen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const organisation: string = testschule;
      const rollenart: string = typeSchueler;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, itslearning)];
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

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`Passwort Ändern öffnen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
        // Passwort
        await expect(profileView.cardHeadline_Passwort).toHaveText('Passwort');
        await expect(profileView.button_NeuesPasswortSetzen).toBeEnabled();

        await profileView.button_NeuesPasswortSetzen.click();
        await profileView.button_PasswortAendern.click();
      });

      await test.step(`Status des Benutzernamenfelds prüfen`, async () => {
        await expect(profileView.label_username).toHaveText(usernames[0]); // Benutzername ist nicht änderbar weil es nur Text ist
        await expect(profileView.text_p_LoginPrompt).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
        await expect(profileView.input_password).toBeEnabled();
        await page.goBack();
        await expect(profileView.cardHeadline_Passwort).toBeVisible();
      });
    }
  );

  test(
    'Das eigene Profil öffnen, 2FA Einrichten öffnen und Einrichtung soweit möglich',
    { tag: [LONG] },
    async ({ page }: PlaywrightTestArgs) => {
      const profileView: ProfilePage = new ProfilePage(page);
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginPage = new LoginPage(page);

      const organisation: string = testschule;
      const rollenart: string = typeLehrer;

      await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getSPId(page, email)];
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

        await header.logout();
        await header.button_login.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Profil öffnen`, async () => {
        await header.button_profil.click();
      });

      await test.step(`2FA öffnen`, async () => {
        await expect(profileView.button_ZurueckVorherigeSeite).toBeVisible();
        await expect(profileView.text_h2_Ueberschrift).toHaveText('Mein Profil');

        await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        await expect(profileView.text_no2FA).toBeVisible();
        await expect(profileView.button_2FAEinrichten).toHaveText('2FA einrichten');
        await expect(profileView.button_2FAEinrichten).toBeEnabled();

        profileView.button_2FAEinrichten.click();
      });

      await test.step(`2FA Texte prüfen und QR-Code generieren`, async () => {
        await expect(profileView.text_LayoutCardHeadline).toHaveText('2FA einrichten');
        await expect(profileView.text_2FASelfServiceInfo).toHaveText(
          'Im Folgenden wird ein QR-Code generiert, mit dem Sie auf Ihrem Endgerät eine Zwei-Faktor-Authentifizierung einrichten können.'
        );
        await expect(profileView.text_2FASelfServiceWarning).toHaveText(
          'Bitte stellen Sie vor dem Fortfahren sicher, dass eine entsprechende App auf Ihrem Endgerät installiert ist. Für Ihr Lehrkräfte-Endgerät finden Sie entsprechend genehmigte Anwendungen im Software-Hub.'
        );
        await expect(profileView.button_2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button_2FAAbbrechen).toHaveText('Abbrechen');
        profileView.button_2FAWeiter.click();
      });

      await test.step(`QR-Code-Display prüfen`, async () => {
        await expect(profileView.text_LayoutCardHeadline).toHaveText('Software-Token einrichten');
        await expect(profileView.text_2FASelfServiceQRInfo).toHaveText(
          'Bitte scannen Sie den QR-Code mit Ihrer 2FA-App (z.B. FreeOTP).'
        );
        await expect(profileView.data_2FAQRCode).toBeVisible();
        await expect(profileView.button_2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button_2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Einrichtung abschließen`, async () => {
        await profileView.button_2FAWeiter.click();

        await expect(profileView.text_LayoutCardHeadline).toHaveText('Zwei-Faktor-Authentifizierung (2FA)');
        await expect(profileView.text_OTPEntryInfo).toHaveText(
          'Bitte geben Sie das angezeigte Einmalpasswort ein, um die Einrichtung abzuschließen.'
        );
        await expect(profileView.text_2FASelfServiceError).toHaveText('Einmalpasswort');
        await expect(profileView.text_OTPInput).toBeVisible();

        await expect(profileView.button_2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button_2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Fehlertext prüfen`, async () => {
        await profileView.button_2FAWeiter.click();
        await expect(profileView.text_OTPEntryError).toHaveText('Das Einmalpasswort muss angegeben werden.');

        await expect(profileView.button_2FAWeiter).toHaveText('Weiter');
        await expect(profileView.button_2FAAbbrechen).toHaveText('Abbrechen');
      });

      await test.step(`Dialog schließen`, async () => {
        await profileView.button_2FAAbbrechen.click();
      });
    }
  );
});
