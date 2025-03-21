import { test, expect, PlaywrightTestArgs, Page } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { Email4TeacherPage } from '../pages/Cards/Email4Teacher.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page';
import { HeaderPage } from '../pages/Header.page';
import { LONG, SHORT, STAGE, BROWSER } from '../base/tags';
import { CalendarPage } from '../pages/Cards/Calendar.page';
import { DirectoryPage } from '../pages/Cards/Directory.page';
import { createTeacherAndLogin } from '../base/api/testHelperPerson.page';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata.ts';
import FromAnywhere from '../pages/FromAnywhere';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;
const ENV: string | undefined = process.env.ENV;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
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
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test('Angebote per Link öffnen als Lehrer', { tag: [LONG, SHORT, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
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

      const emailPagePromise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemEmail.click();
      const emailPage: Page = await emailPagePromise;
      const email4Teacher: Email4TeacherPage = new Email4TeacherPage(emailPage);
      switch (ENV) {
        case 'dev':
          await expect(email4Teacher.text_h1).toBeVisible(); // dummy Seite email wikipedia
          break;
      }
      await emailPage.close();

      // Kalender
      const page_Kalender_Promise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemKalender.click();
      const page_Kalender: Page = await page_Kalender_Promise;
      const kalender: CalendarPage = new CalendarPage(page_Kalender);
      switch (ENV) {
        case 'dev':
          await expect(kalender.text_h1).toBeVisible(); // dummy Seite Kalender wikipedia
          break;
      }
      await page_Kalender.close();

      // Adressbuch
      const directoryPagePromise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemAdressbuch.click();
      const directoryPage: Page = await directoryPagePromise;
      const adressbuch: DirectoryPage = new DirectoryPage(directoryPage);
      switch (ENV) {
        case 'dev':
          await expect(adressbuch.text_h1).toBeVisible(); // dummy Seite Adressbuch wikipedia
          break;
      }
      await directoryPage.close();
    });

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(startseite.textH2Ueberschrift).toBeVisible();
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test(
    'Passwort Reset für einen Lehrer als Landesadmin',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);
      const personManagement: PersonManagementViewPage = new PersonManagementViewPage(page);
      const personManagementDetail: PersonDetailsViewPage = new PersonDetailsViewPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const lastname: string = 'AutoTester';
      const username: string = 'autotester';
      let new_password: string = '';

      await test.step(`Benutzerverwaltung öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
      });

      await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${lastname} anklicken und User-Details öffnen`, async () => {
        await expect(personManagement.text_h2_Benutzerverwaltung).toBeVisible();
        await personManagement.input_Suchfeld.fill(username);
        await personManagement.button_Suchen.click();
        await expect(page.getByRole('cell', { name: lastname, exact: true })).toBeEnabled();
        await page.getByRole('cell', { name: lastname, exact: true }).click();
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
        await header.logout({ logoutViaStartPage: true });
        await landing.button_Anmelden.click();
        await login.login(username, new_password);
      });

      await test.step(`Neues PW vergeben`, async () => {
        await login.updatePW();
        await startseite.validateStartPageIsLoaded();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
