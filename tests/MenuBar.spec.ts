import { test, expect, PlaywrightTestArgs } from '@playwright/test';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE, BROWSER } from '../base/tags';
import FromAnywhere from '../pages/FromAnywhere';

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.button_logout.click();
    });
  });

  test('Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit', {tag: [LONG, SHORT, STAGE, BROWSER]}, async ({ page }: PlaywrightTestArgs) => {
    const startseite = new StartPage(page)
    const menuBar = new MenuPage(page);

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
    })
  })

  test('Test der Funktion "Zurueck zur Startseite"', {tag: [LONG, SHORT, STAGE]}, async ({ page }: PlaywrightTestArgs) => {
    const startseite = new StartPage(page)
    const menuBar = new MenuPage(page);

    await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
      await startseite.cardItemSchulportalAdministration.click();
      await expect(menuBar.header_label_Navigation).toBeVisible();
      await menuBar.button_BackStartpage.click();
      await startseite.checkHeadlineIsVisible();
    })
  })
})