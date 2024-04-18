import { faker } from '@faker-js/faker/locale/de';
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { PersonCreationViewPage } from '../pages/admin/PersonCreationView.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { HeaderPage } from '../pages/Header.page';

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Testfälle für die Administration von Personen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('Einen Benutzer mit der Rolle Lehrkraft anlegen', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);
    const Header = new HeaderPage(page);

    const Rolle = 'Lehrkraft';
    const Vorname = 'TAutoV' + faker.person.firstName();
    const Nachname = 'TAutoN' + faker.person.lastName();;
    const Schulstrukturknoten = '(Testschule Schulportal)'; 
    let Benutzername= '';
    let Einstiegspasswort = '';

    await test.step(`Annmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
    
    await test.step(`Dialog Person anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_BenutzerAnlegen.click();
      await expect(PersonCreationView.text_h2_PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
    })
    
    await test.step(`Benutzer anlegen`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle).click();

      await PersonCreationView.Input_Vorname.click();
      await PersonCreationView.Input_Vorname.fill(Vorname);

      await PersonCreationView.Input_Nachname.click();
      await PersonCreationView.Input_Nachname.fill(Nachname);

      await PersonCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(Schulstrukturknoten).click();

      await PersonCreationView.button_PersonAnlegen.click();
      await expect(PersonCreationView.text_success).toBeVisible();

      Benutzername =  await PersonCreationView.text_Neuer_Benutzername.innerText();
      Einstiegspasswort =  await PersonCreationView.input_EinstiegsPasswort.inputValue();
    })

    await test.step(`In der Ergebnisliste prüfen dass der neue Benutzer ${Nachname} angezeigt wird`, async () => {
      await PersonCreationView.button_ZurueckErgebnisliste.click();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
      await expect(page.getByRole('cell', { name: Nachname, exact: true })).toBeVisible();
    })

    await test.step(`Der neue Benutzer meldet sich mit dem temporären Passwort am Portal an und vergibt ein neues Passwort`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(Benutzername, Einstiegspasswort); 
      await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
  })  
})