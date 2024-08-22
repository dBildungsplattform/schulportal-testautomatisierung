import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { KlasseCreationViewPage } from "../pages/admin/KlasseCreationView.page";
import { KlasseManagementViewPage } from "../pages/admin/KlasseManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { ProfilePage } from "../pages/ProfileView.pagea";
import { getKlasseId, deleteKlasse } from "../base/api/testHelperOrganisation.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test.only("Das eigene Profil öffnen und auf Vollständigkeit prüfen als Landesadmin", async ({ page }) => {
    const ProfileView = new ProfilePage(page);
    const Header = new HeaderPage(page);

    await test.step(`Profil öffnen`, async () => {
      await Header.button_profil.click();
    });

    await test.step(`Profil auf Vollständigkeit prüfen`, async () => {      
      await expect(ProfileView.button_ZurueckVorherigeSeite).toBeVisible();
      await expect(ProfileView.text_h2_Ueberschrift).toHaveText('Mein Profil');
      // Persönliche Daten
      await expect(ProfileView.cardHeadline_PersoenlicheDaten).toHaveText('Persönliche Daten');
      await expect(ProfileView.label_VornameNachname).toHaveText('Vor- und Nachname:');
      await expect(ProfileView.data_VornameNachname).toHaveText('test test');
      await expect(ProfileView.label_Benutzername).toHaveText('Benutzername:');
      await expect(ProfileView.data_Benutzername).toHaveText('test');
      await expect(ProfileView.label_KopersNr).toHaveText('KoPers.-Nr.');
      await expect(ProfileView.data_KopersNr).toHaveText('6056356');
      await expect(ProfileView.icon_InfoPersoenlicheDaten).toBeVisible();
      // Schulzuordnung
      await expect(ProfileView.cardHeadline_Schulzuordnung).toHaveText('Schulzuordnung');
      await expect(ProfileView.label_Schule).toHaveText('Schule:');
      await expect(ProfileView.data_Schule).toHaveText('Land Schleswig-Holstein');
      await expect(ProfileView.label_Rolle).toHaveText('Rolle:');
      await expect(ProfileView.data_Rolle).toHaveText('Landesadmin');
      await expect(ProfileView.label_Dienststellennummer).toHaveText('DStNr.');
      await expect(ProfileView.data_Dienststellennummer).toHaveText('0701114');
      // Passwort
      await expect(ProfileView.cardHeadline_Passwort).toHaveText('Passwort');
      await expect(ProfileView.icon_Schluessel_Passwort).toBeVisible();
      // await expect(ProfileView.button_NeuesPasswortSetzen).toBeEnabled();
      // 2FA
      await expect(ProfileView.cardHeadline_2FA).toHaveText('Zwei-Faktor-Authentifizierung');
      await expect(ProfileView.icon_Schild2FA).toBeVisible();
      // await expect(ProfileView.button_2FAEinrichten).toBeDisabled();
    });
  });

 
});