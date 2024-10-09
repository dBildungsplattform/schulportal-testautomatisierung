import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { ProfilePage } from "../pages/ProfileView.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { createPersonWithUserContext, deletePersonen, addSecondOrganisationToPerson, getPersonId } from "../base/api/testHelperPerson.page";
import { getOrganisationId } from "../base/api/testHelperOrganisation.page";
import { UserInfo } from "../base/api/testHelper.page";
import { deleteRolle, addSystemrechtToRolle, getRolleId } from "../base/api/testHelperRolle.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

let benutzername: string[] = [];
let rolleId: string | undefined = undefined;

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
    const Header = new HeaderPage(page);
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);

    await test.step(`Testdaten löschen via API`, async () => {
      async function processInLoopAsync(benutzername){  // benutzername ist ein array mit allen zu löschenden Benutzern
        for (const item in benutzername){
          const personId = await getPersonId(page, benutzername[item]);
          await deletePersonen(page, personId);
        }
      }

      if (benutzername) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await Header.button_logout.click();
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        
        await processInLoopAsync(benutzername);
        benutzername = [];
      }

      if (rolleId) {
        await deleteRolle(page, rolleId);
        rolleId = undefined;
      }
    });

    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test.only("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
    const Vorname = "TAuto-PW-V-" + faker.person.firstName();
    const Nachname = "TAuto-PW-N-" + faker.person.lastName();
    const Organisation = 'Land Schleswig-Holstein';
    const Rollenname = 'TAuto-PW-R-RolleLandesadmin';
    const Rollenart = 'SYSADMIN'

    await test.step(`Landesadmin via api anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      const userInfo: UserInfo = await createPersonWithUserContext(page, Organisation, Rollenart, Nachname, Vorname, idSP, Rollenname);
      personId = userInfo.personId;
      rolleId = userInfo.rolleId;
      //benutzername = userInfo.username;
      benutzername.push(userInfo.username);
      

      await addSystemrechtToRolle(page, userInfo.rolleId, 'ROLLEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'KLASSEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULTRAEGER_VERWALTEN');

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
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername[0]);
      await expect(ProfileView.label_KopersNr).toBeHidden();
      await expect(ProfileView.data_KopersNr).toBeHidden();
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung   
      await expect(ProfileView.cardHeadline_Schulzuordnung1).toHaveText('Schulzuordnung');
      await expect(ProfileView.label_Schule1).toHaveText('Schule:');
      await expect(ProfileView.data_Schule1).toHaveText(Organisation);
      await expect(ProfileView.label_Rolle1).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle1).toHaveText(Rollenname);
      await expect(ProfileView.label_Dienststellennummer1).toBeHidden();
      await expect(ProfileView.data_Dienststellennummer1).toBeHidden();
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      await expect(ProfileView.text_no2FA).toHaveText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
      await expect(ProfileView.button_2FAEinrichten).toBeEnabled();
    });
  });

  test.only("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrer mit einer Schulzuordnung @short @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
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
      benutzername.push(userInfo.username);

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
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername[0]);
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
      await expect(ProfileView.button_2FAEinrichten).toBeEnabled();  
    });
  });

  test.only("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schüler mit einer Schulzuordnung @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
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
      benutzername.push(userInfo.username);

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
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername[0]);
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
      await expect(ProfileView.cardHeadline_2FA).toBeHidden();
      await expect(ProfileView.icon_Schild2FA).toBeHidden();
      await expect(ProfileView.button_2FAEinrichten).toBeHidden();
    });
  });

  test.only("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Schuladmin mit einer Schulzuordnung @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
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
      benutzername.push(userInfo.username);

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
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername[0]);
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
      await expect(ProfileView.button_2FAEinrichten).toBeEnabled();
    });

    await test.step(`Testdaten via api löschen`, async () => {
    });
  });

  test("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Lehrkraft mit 2 Schulzuordnungen @long @stage", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);
    const Login = new LoginPage(page);

    let personId = '';
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
      benutzername.push(userInfo.username);

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
      await expect(ProfileView.data_Benutzername).toHaveText(benutzername[0]);
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
      await expect(ProfileView.button_2FAEinrichten).toBeEnabled(); 
    });
  });
});