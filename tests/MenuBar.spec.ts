import { test, expect, PlaywrightTestArgs } from '@playwright/test';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { HeaderPage } from '../pages/Header.page';
import { LONG, SHORT, STAGE, BROWSER } from '../base/tags';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import FromAnywhere from '../pages/FromAnywhere';

let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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
    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test(
    'Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menuBar: MenuPage = new MenuPage(page);

      await test.step(`Pruefen der Hauptmenueleiste mit Untermenues`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await expect(menuBar.header_label_Navigation).toBeVisible();
        await expect(menuBar.button_BackStartpage).toBeVisible();
        await expect(menuBar.label_Benutzerverwaltung).toBeVisible();
        await expect(menuBar.menueItem_AlleBenutzerAnzeigen).toBeVisible();
        await expect(menuBar.menueItem_BenutzerAnlegen).toBeVisible();
        await expect(menuBar.label_Klassenverwaltung).toBeVisible();
        await expect(menuBar.label_Rollenverwaltung).toBeVisible();
        await expect(menuBar.menueItem_AlleRollenAnzeigen).toBeVisible();
        await expect(menuBar.menueItem_RolleAnlegen).toBeVisible();
        await expect(menuBar.label_Schulverwaltung).toBeVisible();
        await expect(menuBar.label_Schultraegerverwaltung).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Test der Funktion "Zurueck zur Startseite"',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menuBar: MenuPage = new MenuPage(page);

      await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await expect(menuBar.header_label_Navigation).toBeVisible();
        await menuBar.button_BackStartpage.click();
        await startseite.validateStartPageIsLoaded();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
