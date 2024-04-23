import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { SchuleManagementViewPage } from '../pages/admin/SchuleManagementView.page';

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Ergebnisliste Schulen auf Vollständigkeit prüfen', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const SchuleManagementView = new SchuleManagementViewPage(page);

    await test.step(`Annmelden mit Benutzer ${ADMIN} und Schulverwaltung öffnen`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleSchulenAnzeigen.click();
    })

    await test.step(`Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {      
      await expect(SchuleManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toHaveText('Schulverwaltung');
      await expect(SchuleManagementView.table_header_Dienstellennummer).toBeVisible();
      await expect(SchuleManagementView.table_header_Schulname).toBeVisible();
    })
  })  
})