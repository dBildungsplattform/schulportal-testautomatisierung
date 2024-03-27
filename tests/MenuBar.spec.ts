import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/MenuBar.page';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page)
    const Login = new LoginPage(page);
    const MenuBar = new MenuPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })

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

  test('Test der Funktion "Zurueck zur Startseite"', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page)
    const Login = new LoginPage(page);
    const MenuBar = new MenuPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await expect(MenuBar.header_label_Navigation).toBeVisible();
      await MenuBar.button_BackStartpage.click();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })  
})