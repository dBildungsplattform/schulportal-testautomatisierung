import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { DEV, STAGE } from '../base/tags';
import { loginAndNavigateToAdministration } from '../base/testHelperUtils';
import { StartPage } from '../pages/StartView.page';
import { HeaderPage } from '../pages/components/Header.page';
import { MenuPage } from '../pages/components/MenuBar.page';

let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
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
    { tag: [STAGE, DEV ] },
    async ({ page }: PlaywrightTestArgs) => {
      const menuBar: MenuPage = new MenuPage(page);

      await test.step(`Pruefen der Hauptmenueleiste mit Untermenues`, async () => {
        await expect(menuBar.headerLabelNavigation).toBeVisible();
        await expect(menuBar.buttonBackStartpage).toBeVisible();
        await expect(menuBar.labelBenutzerverwaltung).toBeVisible();
        await expect(menuBar.menueItemAlleBenutzerAnzeigen).toBeVisible();
        await expect(menuBar.menueItemBenutzerAnlegen).toBeVisible();
        await expect(menuBar.labelKlassenverwaltung).toBeVisible();
        await expect(menuBar.labelRollenverwaltung).toBeVisible();
        await expect(menuBar.menueItemAlleRollenAnzeigen).toBeVisible();
        await expect(menuBar.menueItemRolleAnlegen).toBeVisible();
        await expect(menuBar.labelSchulverwaltung).toBeVisible();
        await expect(menuBar.labelSchultraegerverwaltung).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Test der Funktion "Zurueck zur Startseite"',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menuBar: MenuPage = new MenuPage(page);

      await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
        await expect(menuBar.headerLabelNavigation).toBeVisible();
        await menuBar.buttonBackStartpage.click();
        await startseite.validateStartPageIsLoaded();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
