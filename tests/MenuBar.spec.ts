import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE } from '../base/tags';

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

  test.afterEach(async ({ page }) => {
    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.button_logout.click();
    });
  });

  test('Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page)
    const menuBar = new MenuPage(page);

    await test.step(`Pruefen der Hauptmenueleiste mit Untermenues`, async () => {
      await startseite.card_item_schulportal_administration.click();
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

  test('Test der Funktion "Zurueck zur Startseite"', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page)
    const menuBar = new MenuPage(page);

    await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await expect(menuBar.header_label_Navigation).toBeVisible();
      await menuBar.button_BackStartpage.click();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })
})