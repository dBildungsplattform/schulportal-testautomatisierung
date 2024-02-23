import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { Email4TeacherPage } from '../pages/Cards/Email4Teacher.page';
import { ItsLearningPage } from '../pages/Cards/ItsLearning.page';
import { UserManagementViewPage } from '../pages/admin/UserManagementView.page';
import { UserDetailsViewPage } from '../pages/admin/UserDetailsView.page';
import { HeaderPage } from '../pages/header.page';

const PW = process.env.PW;
const USER = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Angebote per Link öffnen', async ({ page}) => {
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Startseite = new StartPage(page);

    await test.step(`Portal öffnen ${FRONTEND_URL}`, async () => {
      await page.goto(FRONTEND_URL);
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
      await expect(Email4Teacher.text_h1).toBeVisible();

      const page_Itslearning_Promise = page.waitForEvent('popup');
      await Startseite.card_item_itslearning.click();
      const page_Itslearning = await  page_Itslearning_Promise; 
      const Itslearning = new ItsLearningPage(page_Itslearning);
      await expect(Itslearning.text_h1).toBeVisible();
      
      await page_Itslearning.close();
      await page_Email4Teacher.close();
    })

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })  

  test('Passwort Reset', async ({ page}) => {
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Startseite = new StartPage(page);
    const UserManagement = new UserManagementViewPage(page);
    const UserManagementDetail = new UserDetailsViewPage(page);
    const Header = new HeaderPage(page);
    const username_lastname = 'Max';
    let new_password = '';

    await test.step(`Portal öffnen ${FRONTEND_URL}`, async () => {
      await page.goto(FRONTEND_URL);
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
      await expect(UserManagement.text_h2_Benutzerverwaltung).toBeVisible();
      await page.getByRole('cell', { name: 'Max' }).click();
    })

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await expect(UserManagementDetail.text_h2_BenutzerBearbeiten).toBeVisible();
      await UserManagementDetail.button_pwChange.click();
      await expect(UserManagementDetail.text_pwResetInfo).toBeVisible();
    })

    await test.step(`In dem overlay den PW-Reset bestätigen, das PW kopieren und Dialog schließen`, async () => {
      await UserManagementDetail.button_pwReset.click();
      await expect(UserManagementDetail.text_pwResetInfo).toBeVisible();
      new_password = await UserManagementDetail.input_pw.inputValue();
      await UserManagementDetail.button_close_pwreset.click();
    })

    await test.step(`Login für Benutzer ${username_lastname} mit dem neuen PW`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login('pwtest', new_password);
    })

    await test.step(`Neues PW vergeben`, async () => {
      await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  }) 
})