import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { MenuePage } from '../pages/menue.page';
import { StartPage } from '../pages/start.page';
import { Email4TeacherPage } from '../pages/email4teacher.page';
import { ItsLearningPage } from '../pages/itslearning.page';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('SPSH-122 Angebote per Link öffnen', async ({ page}) => {
    const Login = new LoginPage(page);
    const Menue = new MenuePage(page);
    const Startseite = new StartPage(page);

    await test.step(`Portal öffnen ${URL_PORTAL}`, async () => {
      await page.goto(URL_PORTAL);
    })

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await Menue.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Menue.button_Abmelden).toBeVisible();
    })

    await test.step(`Startseite öffnen`, async () => {
      await Menue.button_Startseite.click();
      await Startseite.text_h2_Ueberschrift.click();
    })
  
    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      const page_Email4Teacher_Promise = page.waitForEvent('popup');
      await Startseite.card_item_email.click();
      const page_Email4Teacher = await  page_Email4Teacher_Promise; 
      const Email4Teacher = new Email4TeacherPage(page_Email4Teacher);
      await Email4Teacher.text_h1.click();

      const page_Itslearning_Promise = page.waitForEvent('popup');
      await Startseite.card_item_itslearning.click();
      const page_Itslearning = await  page_Itslearning_Promise; 
      const Itslearning = new ItsLearningPage(page_Itslearning);
      await Itslearning.text_h1.click();
      
      await page_Itslearning.close();
      await page_Email4Teacher.close();
    })

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await Startseite.text_h2_Ueberschrift.click();
    })
  })  
})