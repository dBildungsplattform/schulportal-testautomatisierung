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
      const header = new HeaderPage(page);
      await header.button_logout.click();
    });
  });

  test('Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page)
    const MenuBar = new MenuPage(page);

    await test.step(`Pruefen der Hauptmenueleiste mit Untermenues`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await expect(MenuBar.header_label_Navigation).toBeVisible();
      await expect(MenuBar.button_BackStartpage).toBeVisible();
      await expect(MenuBar.label_Benutzerverwaltung).toBeVisible();
      await expect(MenuBar.menueItem_AlleBenutzerAnzeigen).toBeVisible();
      await expect(MenuBar.menueItem_BenutzerAnlegen).toBeVisible();
      await expect(MenuBar.label_Klassenverwaltung).toBeVisible();
      await expect(MenuBar.label_Rollenverwaltung).toBeVisible();
      await expect(MenuBar.menueItem_AlleRollenAnzeigen).toBeVisible();
      await expect(MenuBar.menueItem_RolleAnlegen).toBeVisible();
      await expect(MenuBar.label_Schulverwaltung).toBeVisible();
      await expect(MenuBar.label_Schultraegerverwaltung).toBeVisible();
    })
  })

  test('Test der Funktion "Zurueck zur Startseite"', {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page)
    const MenuBar = new MenuPage(page);

    await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await expect(MenuBar.header_label_Navigation).toBeVisible();
      await MenuBar.button_BackStartpage.click();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })
})