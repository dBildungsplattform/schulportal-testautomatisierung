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
const FRONTEND_URL = process.env.FRONTEND_URL || '';

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
    const Nachname = 'TAutoN' + faker.person.lastName() + '-' + faker.person.lastName(); // Wahrscheinlichkeit doppelter Namen verringern
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
      // Der Klick auf die Ergebnisliste funktioniert nicht zuverlaessig, darum der direkte Sprung in die Ergebnisliste via URL
      await page.goto(FRONTEND_URL + 'admin/personen');
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

  test('Ergebnisliste Benutzer auf Vollständigkeit prüfen', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const PersonManagementView = new PersonManagementViewPage(page);

    await test.step(`Annmelden mit Benutzer ${ADMIN} und Benutzerverwaltung öffnen`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleBenutzerAnzeigen.click();
    })

    await test.step(`Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {   
      await expect(PersonManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toBeVisible();
      await expect(PersonManagementView.text_h2_Benutzerverwaltung).toHaveText('Benutzerverwaltung');
      await expect(PersonManagementView.input_Suchfeld).toBeVisible();
      await expect(PersonManagementView.button_Suchen).toBeVisible();
      await expect(PersonManagementView.table_header_Nachname).toBeVisible();
      await expect(PersonManagementView.table_header_Vorname).toBeVisible();
      await expect(PersonManagementView.table_header_Benutzername).toBeVisible();
      await expect(PersonManagementView.table_header_KopersNr).toBeVisible();
      await expect(PersonManagementView.table_header_Rolle).toBeVisible();
      await expect(PersonManagementView.table_header_Zuordnungen).toBeVisible();
      await expect(PersonManagementView.table_header_Klasse).toBeVisible();
    })
  })  

  test('Prüfung auf ungültige Organisationen bei Anlage Benutzer', async ({ page }) => {
    // Bei Auswahl einer Rolle dürfen in dem Dropdown Administrationsebene nur Organisationen angezeigt werden, die für die Rolle auch gültig sind. Z.B dürfen für die Rolle Landesadmin nur die Organisationen mit Typ ROOT und LAND angezeigt werden.
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const PersonCreationView = new PersonCreationViewPage(page);
    
    const Rolle_LANDESADMIN = 'Landesadmin';
    const Rolle_LEHR = 'Lehrkraft';    
    const Rolle_LIV = 'LiV';
    const Rolle_SCHULADMIN = 'Schuladmin';
    const Rolle_SUS = 'SuS';

    const TYP_ORGA_ROOT = 'ROOT'
    const TYP_ORGA_LAND = 'LAND';
    const TYP_ORGA_SCHULE = 'SCHULE';
  
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
    
    await test.step(`Rolle Landesadmin auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: ROOT, LAND)`, async () => {
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LANDESADMIN).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;
      
      (responseBody_schulstrukturknoten.moeglicheSsks).forEach(element => {
        if(!(element.typ === TYP_ORGA_ROOT) && !(element.typ === TYP_ORGA_LAND)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });  
    })

    await test.step(`Rolle Lehrkraft auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LEHR).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;
      
      (responseBody_schulstrukturknoten.moeglicheSsks).forEach(element => {
        if(!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });   
    })

    await test.step(`Rolle LiV auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_LIV).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;
      
      (responseBody_schulstrukturknoten.moeglicheSsks).forEach(element => {
        if(!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });   
    })

    await test.step(`Rolle Schuladmin auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_SCHULADMIN).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;
      
      (responseBody_schulstrukturknoten.moeglicheSsks).forEach(element => {
        if(!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });   
    })

    await test.step(`Rolle SuS auswaehlen und verfügbare Einträge für die Organisationsebene prüfen(Gültige Organisationen: SCHULE)`, async () => {
      await PersonCreationView.combobox_Rolle_Clear.click();
      await PersonCreationView.combobox_Rolle.click();
      await page.getByText(Rolle_SUS).click();

      const response_schulstrukturknoten = await page.waitForResponse((response) => response.url().includes("/api/personenkontext/schulstrukturknoten"));
      const responseBody_schulstrukturknoten = await response_schulstrukturknoten.json();
      let gueltig = true;
      
      (responseBody_schulstrukturknoten.moeglicheSsks).forEach(element => {
        if(!(element.typ === TYP_ORGA_SCHULE)) {
          gueltig = false; // element hat eine Organisation mit einem ungültigen Typ
          expect(gueltig).toBe(true); // Der Testfall wird auf failed gesetzt
        }
      });   
    })
  })
})