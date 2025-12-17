import { expect, Page, PlaywrightTestArgs, test } from '@playwright/test';
import { createTeacherAndLogin, UserInfo } from '../base/api/personApi';
import { DEV, LONG, SHORT, STAGE } from '../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata';
import FromAnywhere from '../pages/FromAnywhere';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from '../pages/components/Header.page';
import { CalendarPage } from '../pages/components/service-provider-cards/Calendar.page';
import { DirectoryPage } from '../pages/components/service-provider-cards/Directory.page';
import { Email } from '../pages/components/service-provider-cards/Email.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

const isStageTest = (): boolean => process.env.ENV === 'stage' || process.env.TAG === 'stage';

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
      await landing.buttonAnmelden.click();
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

  test('Angebote per Link öffnen als Lehrer', { tag: [LONG, SHORT, STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
    const startseite: StartPage = new StartPage(page);
    let userInfoAdmin: UserInfo;

    await test.step(`Lehrer via api anlegen und mit diesem anmelden`, async () => {
      userInfoAdmin = await createTeacherAndLogin(page);
      currentUserIsLandesadministrator = false;
      usernames.push(userInfoAdmin.username);
      rolleIds.push(userInfoAdmin.rolleId);
    });

    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      // TODO: Die Schnittstelle email für Lehrkräfte(ox) gibt es nur auf stage
      // Auf dev wird nur getestet, dass die url für ox aufgerufen wird wenn man die Kachel email anklickt
      // Wenn SPSH-1043 auf stage deployed ist, muss der Test erweitert werden. Hier muss dann das erwartete Verhalten getestet werden, wenn man auf stage auf die Kachel(email, Adressbuch, Kalender)  klickt
      await expect(startseite.cardItemEmail).toBeVisible(); // warten bis die Seite geladen ist

      const emailPagePromise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemEmail.click();
      const emailPage: Page = await emailPagePromise;
      const email: Email = new Email(emailPage);
      if (isStageTest()) {
        // TODO: implement assertion
      } else {
          await expect(email.textH1).toBeVisible(); // dummy Seite email wikipedia
      }
      await emailPage.close();

      // Kalender
      const pageKalenderPromise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemKalender.click();
      const pageKalender: Page = await pageKalenderPromise;
      const kalender: CalendarPage = new CalendarPage(pageKalender);
      if (isStageTest()) {
        // TODO: implement assertion
      } else {
        await expect(kalender.textH1).toBeVisible(); // dummy Seite Kalender wikipedia
      }
      await pageKalender.close();

      // Adressbuch
      const directoryPagePromise: Promise<Page> = page.waitForEvent('popup');
      await startseite.cardItemAdressbuch.click();
      const directoryPage: Page = await directoryPagePromise;
      const adressbuch: DirectoryPage = new DirectoryPage(directoryPage);
      if (isStageTest()) {
        // TODO: implement assertion
      } else {
        await expect(adressbuch.textH1).toBeVisible(); // dummy Seite Adressbuch wikipedia
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
});