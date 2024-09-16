import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { ProfilePage } from "../pages/ProfileView.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { createPersonWithUserContext, deletePersonen, addSecondOrganisationToPerson } from "../base/api/testHelperPerson.page";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page";
import { UserInfo } from "../base/api/testHelper.page";
import { deleteRolle } from "../base/api/testHelperRolle.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für das eigene Profil anzeigen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const Landing = new LandingPage(page);
      const Startseite = new StartPage(page);
      const Login = new LoginPage(page);

      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);

    const Benutzername = 'test';
    const Vorname = "test";
    const Nachname = "test"
    const Organisation = 'Land Schleswig-Holstein';
    const Dienststellennummer = '0701114';
    const Rolle = 'Landesadmin';
    const KopersNr = '6056356';

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText(Vorname + ' ' + Nachname);
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText(Benutzername);
      await expect(ProfileView.label_KopersNr).toHaveText('KoPers.-Nr.:');
      await expect(ProfileView.data_KopersNr).toHaveText(KopersNr);
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung  
      // Kann wegen dem bug: SPSH-1085 nicht getestet werden 
      // await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
      // await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      // await expect(ProfileView.data_Schule1).toHaveText(Organisation);
      // await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      // await expect(ProfileView.data_Rolle1).toHaveText(Rolle);
      // await expect(ProfileView.label_Dienststellennummer1).toHaveText('DStNr.:');
      // await expect(ProfileView.data_Dienststellennummer1).toHaveText(Dienststellennummer);
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      // await expect(ProfileView.button_2FAEinrichten).toBeDisabled(); Aktuell disabled im FE bis SPSH-855 fertig ist
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung @short @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
    let rolleId = '';
    let benutzername = '';
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Organisation = 'Testschule Schulportal';
    const Dienststellennummer = '1111111';
    const Rollenname = 'TAuto-PW-R-RolleLehrer';
    const Rollenart = 'LEHR';
    
    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'E-Mail');
      const userInfo: UserInfo = await createPersonWithUserContext(page, Organisation, Rollenart, Nachname, Vorname, idSP, Rollenname);
      personId = userInfo.personId;
      rolleId = userInfo.rolleId;
      benutzername = userInfo.username;

      await Header.button_logout.click();  
      await Header.button_login.click();
      await Login.login(userInfo.username, userInfo.password);
      await Login.UpdatePW();
    });

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText(Vorname + ' ' + Nachname);
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername);
      await expect(ProfileView.label_KopersNr).toBeHidden();
      await expect(ProfileView.data_KopersNr).toBeHidden();
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung
      await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
      await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      await expect(ProfileView.data_Schule1).toHaveText(Organisation);
      await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle1).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer1).toHaveText('DStNr.:');
      await expect(ProfileView.data_Dienststellennummer1).toHaveText(Dienststellennummer);
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      // #ToDo Aktuell disabled im FE bis SPSH-855 fertig ist
      // await expect(ProfileView.button_2FAEinrichten).toBeDisabled();  
    });

    await test.step(`Testdaten via api löschen`, async () => {
      await Header.button_logout.click();
      await Header.button_login.click();
      await Login.login(ADMIN, PW);
      await deletePersonen(page, personId);
      await deleteRolle(page, rolleId);
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
    let rolleId = '';
    let benutzername = '';
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Organisation = 'Testschule Schulportal';
    const Dienststellennummer = '1111111';
    const Rollenname = 'TAuto-PW-R-RolleSchüler';
    const Rollenart = 'LERN';
    
    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'itslearning');
      const userInfo: UserInfo = await createPersonWithUserContext(page, Organisation, Rollenart, Nachname, Vorname, idSP, Rollenname);
      personId = userInfo.personId;
      rolleId = userInfo.rolleId;
      benutzername = userInfo.username;

      await Header.button_logout.click();  
      await Header.button_login.click();
      await Login.login(userInfo.username, userInfo.password);
      await Login.UpdatePW();
    });

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText(Vorname + ' ' + Nachname);
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername);
      await expect(ProfileView.label_KopersNr).toBeHidden();
      await expect(ProfileView.data_KopersNr).toBeHidden();
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung
      await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
      await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      await expect(ProfileView.data_Schule1).toHaveText(Organisation);
      await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle1).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer1).toHaveText('DStNr.:');
      await expect(ProfileView.data_Dienststellennummer1).toHaveText(Dienststellennummer);
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      // await expect(ProfileView.button_2FAEinrichten).toBeDisabled(); Aktuell disabled im FE bis SPSH-855 fertig ist
    });

    await test.step(`Testdaten via api löschen`, async () => {
      await Header.button_logout.click();
      await Header.button_login.click();
      await Login.login(ADMIN, PW);
      await deletePersonen(page, personId);
      await deleteRolle(page, rolleId);
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
    let rolleId = '';
    let benutzername = '';
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Organisation = 'Testschule Schulportal';
    const Dienststellennummer = '1111111';
    const Rollenname = 'TAuto-PW-R-RolleSchuladmin';
    const Rollenart = 'LEIT'
    
    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      const userInfo: UserInfo = await createPersonWithUserContext(page, Organisation, Rollenart, Nachname, Vorname, idSP, Rollenname);
      personId = userInfo.personId;
      rolleId = userInfo.rolleId;
      benutzername = userInfo.username;

      await Header.button_logout.click();  
      await Header.button_login.click();
      await Login.login(userInfo.username, userInfo.password);
      await Login.UpdatePW();
    });

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText(Vorname + ' ' + Nachname);
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername);
      await expect(ProfileView.label_KopersNr).toBeHidden();
      await expect(ProfileView.data_KopersNr).toBeHidden();
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung
      await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
      await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      await expect(ProfileView.data_Schule1).toHaveText(Organisation);
      await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle1).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer1).toHaveText('DStNr.:');
      await expect(ProfileView.data_Dienststellennummer1).toHaveText(Dienststellennummer);
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      // await expect(ProfileView.button_2FAEinrichten).toBeDisabled(); Aktuell disabled im FE bis SPSH-855 fertig ist
    });

    await test.step(`Testdaten via api löschen`, async () => {
      await Header.button_logout.click();
      await Header.button_login.click();
      await Login.login(ADMIN, PW);
      await deletePersonen(page, personId);
      await deleteRolle(page, rolleId);
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrkraft mit 2 Schulzuordnungen @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
    let rolleId = '';
    let benutzername = '';
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Organisation1 = 'Testschule Schulportal';
    const Organisation2 = 'Carl-Orff-Schule';
    const Dienststellennummer1 = '1111111';
    const Dienststellennummer2 = '0702948';
    const Rollenname = 'TAuto-PW-R-RolleLehrer';
    const Rollenart = 'LEHR';
    
    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      const userInfo: UserInfo = await createPersonWithUserContext(page, Organisation1, Rollenart, Nachname, Vorname, idSP, Rollenname);
      personId = userInfo.personId;
      rolleId = userInfo.rolleId;
      benutzername = userInfo.username;

      await addSecondOrganisationToPerson(page, personId, await getOrganisationId(page, Organisation1), await getOrganisationId(page, Organisation2), rolleId);
      await Header.button_logout.click();  
      await Header.button_login.click();
      await Login.login(userInfo.username, userInfo.password);
      await Login.UpdatePW();
    });

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText(Vorname + ' ' + Nachname);
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername);
      await expect(ProfileView.label_KopersNr).toBeHidden();
      await expect(ProfileView.data_KopersNr).toBeHidden();
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung 1
      await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung 1');
      await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      await expect(ProfileView.data_Schule1).toHaveText(Organisation1);
      await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle1).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer1).toHaveText('DStNr.:');
      await expect(ProfileView.data_Dienststellennummer1).toHaveText(Dienststellennummer1);
      // Schulzuordnung 2
      await expect(ProfileView.cardHeadline_Schulzuordnung2).toHaveText('Schulzuordnung 2');
      await expect(ProfileView.label_Schule2).toHaveText('Schule:');
      await expect(ProfileView.data_Schule2).toHaveText(Organisation2);
      await expect(ProfileView.label_Rolle2).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle2).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer2).toHaveText('DStNr.:');
      await expect(ProfileView.data_Dienststellennummer2).toHaveText(Dienststellennummer2);
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      await expect(ProfileView.button_2FAEinrichten).toBeDisabled(); // Aktuell disabled im FE bis SPSH-855 fertig ist
    });

    await test.step(`Testdaten via api löschen`, async () => {
      await Header.button_logout.click();
      await Header.button_login.click();
      await Login.login(ADMIN, PW);
      await deletePersonen(page, personId);
      await deleteRolle(page, rolleId);
    });
  });
});