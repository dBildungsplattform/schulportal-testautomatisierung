import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { ItsLearningPage } from "../pages/Cards/ItsLearning.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page";
import { HeaderPage } from "../pages/Header.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test("Angebote per Link öffnen als Landesadmin @long", async ({ page }) => {
    const Startseite = new StartPage(page);

    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      // Kachel email
      // Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel email anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel  klickt
      const page_Email4Teacher_Promise = page.waitForEvent("popup");
      await Startseite.card_item_email.click();
      const page_email4Teacher = await page_Email4Teacher_Promise;
      if (FRONTEND_URL.includes('dev.spsh')) {
        await expect(page_email4Teacher.getByText('error_category: ox-error')).toBeVisible();
      }

      // Kachel Kalender
      // Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel Kalender anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel klickt
      const page_calendar_Promise = page.waitForEvent("popup");
      await Startseite.card_item_calendar.click();
      const page_calendar = await page_calendar_Promise;
      if (FRONTEND_URL.includes('dev.spsh')) {
        await expect(page_calendar.getByText('error_category: ox-error')).toBeVisible();
      }

      // Kachel Adressbuch
      // Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel Adressbuch anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel klickt
      const page_directory_Promise = page.waitForEvent("popup");
      await Startseite.card_item_directory.click();
      const page_directory = await page_directory_Promise;
      if(FRONTEND_URL.includes('dev.spsh')) {
        await expect(page_directory.getByText('error_category: ox-error')).toBeVisible();
      }

      // Kachel itslearning
      const page_itslearning_Promise = page.waitForEvent("popup");
      await Startseite.card_item_itslearning.click();
      const page_itslearning = await page_itslearning_Promise;
      const itslearning = new ItsLearningPage(page_itslearning);
      await expect(itslearning.text_h1).toBeVisible();

      // Tabs email und itslearning schließen
      await page_email4Teacher.close();
      await page_calendar.close();
      await page_directory.close();
      await page_itslearning.close();
    });

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Passwort Reset für einen Lehrer als Landesadmin @long @short @stage", async ({ page }) => {
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Startseite = new StartPage(page);
    const PersonManagement = new PersonManagementViewPage(page);
    const PersonManagementDetail = new PersonDetailsViewPage(page);
    const Header = new HeaderPage(page);
    const lastname = "AutoTester";
    const username = "autotester";
    let new_password = "";

    await test.step(`Benutzerverwaltung öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
    });

    await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${lastname} anklicken und User-Details öffnen`, async () => {
      await expect(PersonManagement.text_h2_Benutzerverwaltung).toBeVisible();
      await page.getByRole("cell", { name: lastname, exact: true }).click();
    });

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await expect(PersonManagementDetail.text_h2_BenutzerBearbeiten).toBeVisible();
      await PersonManagementDetail.button_pwChange.click();
      await expect(PersonManagementDetail.text_pwResetInfo).toBeVisible();
    });

    await test.step(`In dem overlay den PW-Reset bestätigen, das PW kopieren und Dialog schließen`, async () => {
      await PersonManagementDetail.button_pwReset.click();
      await expect(PersonManagementDetail.text_pwResetInfo).toBeVisible();
      new_password = await PersonManagementDetail.input_pw.inputValue();
      await PersonManagementDetail.button_close_pwreset.click();
    });

    await test.step(`Login für Benutzer ${lastname} mit dem neuen PW`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(username, new_password);
    });

    await test.step(`Neues PW vergeben`, async () => {
      await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });
});
