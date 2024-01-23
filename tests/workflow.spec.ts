import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/landing.page';
import { LoginPage } from '../pages/login.page';
import { StartPage } from '../pages/start.page';
import { Email4TeacherPage } from '../pages/email4teacher.page';
import { ItsLearningPage } from '../pages/itslearning.page';
import { UserManagementPage } from '../pages/user_management.page';
import { UserManagementDetailPage } from '../pages/user_management_detail.page';
import { HeaderPage } from '../pages/header.page';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.URL_PORTAL}:`, () => {
  test('SPSH-122 Angebote per Link öffnen', async ({ page}) => {
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Startseite = new StartPage(page);

    await test.step(`Portal öffnen ${URL_PORTAL}`, async () => {
      await page.goto(URL_PORTAL);
    })

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
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

  test('SPSH-215 Passwort Reset', async ({ page}) => {
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Startseite = new StartPage(page);
    const UserManagement = new UserManagementPage(page);
    const UserManagementDetail = new UserManagementDetailPage(page);
    const Header = new HeaderPage(page);
    const username_lastname = 'Max';
    let NewPW_Username = '';

    await test.step(`Portal öffnen ${URL_PORTAL}`, async () => {
      await page.goto(URL_PORTAL);
    })

    await test.step(`Annmelden mit Administrator ${USER}`, async () => {
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Benutzerverwaltung öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
    })

    await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${username_lastname} anklicken und User-Details öffnen`, async () => {
      await UserManagement.text_h2.click();
      await page.getByRole('cell', { name: 'Max' }).click();
    })

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await UserManagementDetail.text_h2.click();
      await UserManagementDetail.button_pwChange.click();
      await UserManagementDetail.text_warning_pwReset.click();
    })

    await test.step(`In dem overlay den PW-Reset bestätigen, das PW kopieren und Dialog schließen`, async () => {
      await UserManagementDetail.button_pwReset.click();
      await UserManagementDetail.text_pwResetInfo.click();
      await UserManagementDetail.icon_pwVisible.click();
      NewPW_Username = await UserManagementDetail.input_pw.inputValue();
      await UserManagementDetail.button_close_pwreset.click();
    })

    await test.step(`Login für Benutzer ${username_lastname} mit dem neuen PW`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login('pwtest', NewPW_Username);
    })

    await test.step(`Neues PW vergeben`, async () => {
      await Login.UpdatePW();
      await Startseite.text_h2_Ueberschrift.click();
    })
  }) 
})