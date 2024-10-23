import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { Email4TeacherPage } from "../pages/Cards/Email4Teacher.page";
import { ItsLearningPage } from "../pages/Cards/ItsLearning.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page";
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE } from "../base/tags";
import { CalendarPage } from "../pages/Cards/Calendar.page";
import { DirectoryPage } from "../pages/Cards/Directory.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";
const ENV = process.env.ENV;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const landing = new LandingPage(page);
      const startseite = new StartPage(page);
      const login = new LoginPage(page);

      await page.goto(FRONTEND_URL);
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Angebote per Link öffnen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);

    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      // email
      // Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel email anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel(email, Adressbuch, Kalender)  klickt
      const page_Email4Teacher_Promise = page.waitForEvent("popup");
      await startseite.card_item_email.click();
      const page_Email4Teacher = await page_Email4Teacher_Promise;
      const email4Teacher = new Email4TeacherPage(page_Email4Teacher);
      switch (ENV) {
        case 'dev':
          await expect(email4Teacher.text_h1).toBeVisible(); // dummy Seite email wikipedia
          break;
      }
      await page_Email4Teacher.close();

      // Kalender
      const page_Kalender_Promise = page.waitForEvent("popup");
      await startseite.card_item_kalender.click();
      const page_Kalender = await page_Kalender_Promise;
      const kalender = new CalendarPage(page_Kalender);
      switch (ENV) {
        case 'dev':
          await expect(kalender.text_h1).toBeVisible(); // dummy Seite Kalender wikipedia
          break;
      }
      await page_Kalender.close();

       // Adressbuch
       const page_Adressbuch_Promise = page.waitForEvent("popup");
       await startseite.card_item_adressbuch.click();
       const page_Adressbuch = await page_Adressbuch_Promise;
       const adressbuch = new DirectoryPage(page_Adressbuch);
       switch (ENV) {
         case 'dev':
           await expect(adressbuch.text_h1).toBeVisible(); // dummy Seite Adressbuch wikipedia
           break;
       }
       await page_Adressbuch.close();
     
      // itslearning
      const page_itslearning_Promise = page.waitForEvent("popup");
      await startseite.card_item_itslearning.click();
      const page_Itslearning = await page_itslearning_Promise;
      const itslearning = new ItsLearningPage(page_Itslearning);
      await expect(itslearning.text_h1).toBeVisible();
      await page_Itslearning.close();
    });

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Passwort Reset für einen Lehrer als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const landing = new LandingPage(page);
    const login = new LoginPage(page);
    const startseite = new StartPage(page);
    const personManagement = new PersonManagementViewPage(page);
    const personManagementDetail = new PersonDetailsViewPage(page);
    const header = new HeaderPage(page);
    const lastname = "AutoTester";
    const username = "autotester";
    let new_password = "";

    await test.step(`Benutzerverwaltung öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
    });

    await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${lastname} anklicken und User-Details öffnen`, async () => {
      await expect(personManagement.text_h2_Benutzerverwaltung).toBeVisible();
      await page.getByRole("cell", { name: lastname, exact: true }).click();
    });

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await expect(personManagementDetail.text_h2_BenutzerBearbeiten).toBeVisible();
      await personManagementDetail.button_pwChange.click();
      await expect(personManagementDetail.text_pwResetInfo).toBeVisible();
    });

    await test.step(`In dem overlay den PW-Reset bestätigen, das PW kopieren und Dialog schließen`, async () => {
      await personManagementDetail.button_pwReset.click();
      await expect(personManagementDetail.text_pwResetInfo).toBeVisible();
      new_password = await personManagementDetail.input_pw.inputValue();
      await personManagementDetail.button_close_pwreset.click();
    });

    await test.step(`Login für Benutzer ${lastname} mit dem neuen PW`, async () => {
      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(username, new_password);
    });

    await test.step(`Neues PW vergeben`, async () => {
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });
});
