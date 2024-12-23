import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { HeaderPage } from "../pages/Header.page";
import { ProfilePage } from "../pages/ProfileView.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { createRolleAndPersonWithUserContext, addSecondOrganisationToPerson } from "../base/api/testHelperPerson.page";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page";
import { UserInfo } from "../base/api/testHelper.page";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page";
import { LONG, SHORT, STAGE, BROWSER } from "../base/tags";
import { deleteRolleById, deletePersonenBySearchStrings} from "../base/testHelperDeleteTestdata";
import { generateNachname, generateVorname, generateRolleName } from "../base/testHelperGenerateTestdataNames.ts";
import { testschule, testschule665, landSH } from "../base/organisation.ts";

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let roleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);

      await page.goto('/');
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);

    await test.step(`Testdaten löschen via API`, async () => {
      if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        const startseite: StartPage = new StartPage(page);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        await expect(startseite.card_item_schulportal_administration).toBeVisible();
        
        await deletePersonenBySearchStrings(page, username);
        username = [];
      }

      if (roleId) {
        deleteRolleById(roleId, page);
        roleId = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, STAGE, BROWSER]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);
    const startseite: StartPage = new StartPage(page);

    const vorname = await generateVorname();
    const nachname = await generateNachname();
    const organisation = landSH;
    const rollenname = await generateRolleName();
    const rollenart = 'SYSADMIN'

    await test.step(`Landesadmin via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation, rollenart, nachname, vorname, idSPs, rollenname);
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

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
      await login.UpdatePW();
    });

    await test.step(`Profil öffnen`, async () => {
      await expect(startseite.card_item_schulportal_administration).toBeVisible();
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
      await expect(profileView.data_Benutzername).toHaveText(username[0]);
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
      // Aktuell wird der Abschnitt 2FA generell nicht angezeigt
      // await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      // await expect(profileView.text_no2FA).toHaveText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
      // await expect(profileView.button_2FAEinrichten).toBeEnabled();
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);

    const vorname = await generateVorname();
    const nachname = await generateNachname();
    const organisation = testschule;
    const dienststellenNr = '1111111';
    const rollenname =  await generateRolleName();
    const rollenart = 'LEHR';

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'E-Mail')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation, rollenart, nachname, vorname, idSPs, rollenname);
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

      await header.logout();
      await header.button_login.click();
      await login.login(userInfo.username, userInfo.password);
      await login.UpdatePW();
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
      await expect(profileView.data_Benutzername).toHaveText(username[0]);
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
      // Aktuell wird der Abschnitt 2FA generell nicht angezeigt
      // await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      // await expect(profileView.button_2FAEinrichten).toBeEnabled();
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung", {tag: [LONG, STAGE]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);

    const vorname = await generateVorname();
    const nachname = await generateNachname();
    const organisation = testschule;
    const dienststellenNr = '1111111';
    const rollenname =  await generateRolleName();
    const rollenart = 'LERN';

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'itslearning')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation, rollenart, nachname, vorname, idSPs, rollenname);
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

      await header.logout();
      await header.button_login.click();
      await login.login(userInfo.username, userInfo.password);
      await login.UpdatePW();
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
      await expect(profileView.data_Benutzername).toHaveText(username[0]);
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
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung", {tag: [LONG, STAGE]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);

    const vorname = await generateVorname();
    const nachname = await generateNachname();
    const organisation = testschule;
    const dienststellenNr = '1111111';
    const rollenname =  await generateRolleName();
    const rollenart = 'LEIT'

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation, rollenart, nachname, vorname, idSPs, rollenname);
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

      await header.logout();
      await header.button_login.click();
      await login.login(userInfo.username, userInfo.password);
      await login.UpdatePW();
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
      await expect(profileView.data_Benutzername).toHaveText(username[0]);
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
      // Aktuell wird der Abschnitt 2FA generell nicht angezeigt
      // await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      // await expect(profileView.button_2FAEinrichten).toBeEnabled();
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrkraft mit 2 Schulzuordnungen", {tag: [LONG, STAGE]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login: LoginPage = new LoginPage(page);

    let personId = '';
    const vorname = await generateVorname();
    const nachname = await generateNachname();
    const organisation1 = testschule;
    const organisation2 = testschule665;
    const dienststellenNr1 = '1111111';
    const dienststellenNr2 = '1111165';
    const rollenname =  await generateRolleName();
    const rollenart = 'LEHR';

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation1, rollenart, nachname, vorname, idSPs, rollenname);
      personId = userInfo.personId;
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

      await addSecondOrganisationToPerson(page, personId, await getOrganisationId(page, organisation1), await getOrganisationId(page, organisation2), roleId[0]);
      await header.logout();
      await header.button_login.click();
      await login.login(userInfo.username, userInfo.password);
      await login.UpdatePW();
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
      await expect(profileView.data_Benutzername).toHaveText(username[0]);
      await expect(profileView.label_KopersNr).toBeHidden();
      await expect(profileView.data_KopersNr).toBeHidden();
      await expect(profileView.icon_InfoPersoenlicheDaten).toBeVisible();
      
      // prüfen, welche von den beiden Schulen zuerst angezeigt wird in der Tabelle
      if(await profileView.data_Schule1.innerText() == organisation1) {
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
        // Aktuell wird der Abschnitt 2FA generell nicht angezeigt
        // await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        // await expect(profileView.button_2FAEinrichten).toBeEnabled();
      } 
      else {
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
        // Aktuell wird der Abschnitt 2FA generell nicht angezeigt
        // await expect(profileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
        // await expect(profileView.button_2FAEinrichten).toBeEnabled();
        
      }
    });
  });

  test("Das eigene Profil öffnen, Passwort Ändern öffnen, und Status des Benutzernamenfelds prüfen", {tag: [LONG, STAGE]}, async ({ page }) => {
    const profileView = new ProfilePage(page);
    const header = new HeaderPage(page);
    const login = new LoginPage(page);

    const organisation = testschule;
    const rollenart = 'LERN';

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSPs: Array<string> = [await getSPId(page, 'itslearning')];
      const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, organisation, rollenart, await generateNachname(), await generateVorname(), idSPs, await generateRolleName());
      roleId.push(userInfo.rolleId);
      username.push(userInfo.username);

      await header.logout();
      await header.button_login.click();
      await login.login(userInfo.username, userInfo.password);
      await login.UpdatePW();
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

      profileView.button_NeuesPasswortSetzen.click();
      profileView.button_PasswortAendern.click();
    });

    await test.step(`Status des Benutzernamenfelds prüfen`, async () => {
      await expect(profileView.label_username).toHaveText(username[0]); // Benutzername ist nicht änderbar weil es nur Text ist
      await expect(profileView.text_p_LoginPrompt).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
      await expect(profileView.input_password).toBeEnabled();
      await page.goBack();
    });
  });
});