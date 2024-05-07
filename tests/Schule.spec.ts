import { faker } from '@faker-js/faker/locale/de';
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { SchuleCreationViewPage } from '../pages/admin/SchuleCreationView.page';

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || '';

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('2 Schulen nacheinander anlegen', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const SchuleCreationView = new SchuleCreationViewPage(page);

    const SCHULNAME1 = 'TAutoS1' + faker.word.noun() + '-' + faker.word.noun(); // Wahrscheinlichkeit doppelter Namen verringern
    const SCHULNAME2 = 'TAutoS2' + faker.word.noun() + '-' + faker.word.noun();
    const DIENSTSTELLENNUMMER1 = '3310176111';
    const DIENSTSTELLENNUMMER2 = '0481165563';

    await test.step(`Annmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
    
    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_h2_SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
    })
    
    await test.step(`Erste Schule anlegen`, async () => {
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.click();
      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER1);

      await SchuleCreationView.input_Schulname.click();
      await SchuleCreationView.input_Schulname.fill(SCHULNAME1);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    })

    await test.step(`Zweite Schule anlegen`, async () => {
      await SchuleCreationView.button_WeitereSchuleAnlegen.click();
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.click();
      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER2);

      await SchuleCreationView.input_Schulname.click();
      await SchuleCreationView.input_Schulname.fill(SCHULNAME2);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    })
  })
})