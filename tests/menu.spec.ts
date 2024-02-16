import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { StartPage } from '../pages/start.page';
import { LoginPage } from '../pages/login.page';
import { MenuPage } from '../pages/menu.page';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für die Hauptmenue-Leiste: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('Test der Hauptenue-Leiste und Untermenues auf Vollständigkeit', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page)
    const Login = new LoginPage(page);
    const Menu = new MenuPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Pruefen der Hauptmenueleiste mit Untermenues`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await expect(Menu.header_label_Navigation).toBeVisible();
      await expect(Menu.button_BackStartpage).toBeVisible();
      await expect(Menu.label_Benutzerverwaltung).toBeVisible();
      await expect(Menu.menueItem_AlleBenutzerAnzeigen).toBeVisible();
      await expect(Menu.menueItem_BenutzerAnlegen).toBeVisible();
      await expect(Menu.label_Klassenverwaltung).toBeVisible();
      await expect(Menu.label_Rollenverwaltung).toBeVisible();
      await expect(Menu.menueItem_AlleRollenAnzeigen).toBeVisible();
      await expect(Menu.menueItem_RolleAnlegen).toBeVisible();
      await expect(Menu.label_Schulverwaltung).toBeVisible();
      await expect(Menu.label_Schultraegerverwaltung).toBeVisible();
    })    
  })  

  test('Test der Funktion "Zuück zur Starseite"', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page)
    const Login = new LoginPage(page);
    const Menu = new MenuPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(URL_PORTAL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Menue-Eintrag zum Rücksprung auf die Startseite klicken`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await expect(Menu.header_label_Navigation).toBeVisible();
      await Menu.button_BackStartpage.click();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })  
})