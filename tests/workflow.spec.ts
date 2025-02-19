import { test, expect, PlaywrightTestArgs } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { Email4TeacherPage } from "../pages/Cards/Email4Teacher.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page";
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE, BROWSER } from "../base/tags";
import { CalendarPage } from "../pages/Cards/Calendar.page";
import { DirectoryPage } from "../pages/Cards/Directory.page";
import { createTeacherAndLogin } from "../base/api/testHelperPerson.page";
import { UserInfo} from "../base/api/testHelper.page.ts";
import { deletePersonenBySearchStrings, deleteRolleById } from "../base/testHelperDeleteTestdata.ts";
import FromAnywhere from '../pages/FromAnywhere';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;
const ENV: string | undefined = process.env.ENV;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage = await FromAnywhere(page)
        .start()
        .then((landing) => landing.goToLogin())
        .then((login) => login.login())
        .then((startseite) => startseite.checkHeadlineIsVisible());
  
      return startPage;
    });
  });

  test.afterEach(async ({page}) => {
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

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
        if (usernames.length > 0) { 
            await deletePersonenBySearchStrings(page, usernames);
            usernames = [];
        }

        if (rolleIds.length > 0) { 
          await deleteRolleById(rolleIds, page);
          rolleIds = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
        await header.logout();
    });
});

  test("Angebote per Link öffnen als Lehrer", {tag: [LONG, SHORT, STAGE]}, async ({ page }: PlaywrightTestArgs) => {
    const startseite: StartPage = new StartPage(page);

    let userInfoAdmin: UserInfo;

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => { 
      userInfoAdmin = await createTeacherAndLogin(page);
      currentUserIsLandesadministrator = false;
      usernames.push(userInfoAdmin.username);
      rolleIds.push(userInfoAdmin.rolleId);
    });

    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      // email
      // Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel email anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel(email, Adressbuch, Kalender)  klickt
      await expect(startseite.cardItemEmail).toBeVisible(); // warten bis die Seite geladen ist

      const page_Email4Teacher_Promise = page.waitForEvent("popup");
      await startseite.cardItemEmail.click();
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
      await startseite.cardItemKalender.click();
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
       await startseite.cardItemAdressbuch.click();
       const page_Adressbuch = await page_Adressbuch_Promise;
       const adressbuch = new DirectoryPage(page_Adressbuch);
       switch (ENV) {
         case 'dev':
           await expect(adressbuch.text_h1).toBeVisible(); // dummy Seite Adressbuch wikipedia
           break;
       }
       await page_Adressbuch.close();
    });

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(startseite.textH2Ueberschrift).toBeVisible();
    });
  });

  test("Passwort Reset für einen Lehrer als Landesadmin", {tag: [LONG, SHORT, STAGE, BROWSER]}, async ({ page }: PlaywrightTestArgs) => {
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
      await startseite.cardItemSchulportalAdministration.click();
    });

    await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${lastname} anklicken und User-Details öffnen`, async () => {
      await expect(personManagement.text_h2_Benutzerverwaltung).toBeVisible();
      await personManagement.input_Suchfeld.fill(username);
      await personManagement.button_Suchen.click();
      await expect(page.getByRole("cell", { name: lastname, exact: true })).toBeEnabled();
      await page.getByRole("cell", { name: lastname, exact: true }).click();
    });

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await expect(personManagementDetail.text_h2_benutzerBearbeiten).toBeVisible();
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
      await startseite.checkHeadlineIsVisible();
    });
  });
});
