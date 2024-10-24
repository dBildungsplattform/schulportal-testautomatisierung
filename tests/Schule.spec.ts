import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { SchuleCreationViewPage } from "../pages/admin/SchuleCreationView.page";
import { SchuleManagementViewPage } from "../pages/admin/SchuleManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { createPersonWithUserContext } from "../base/api/testHelperPerson.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { UserInfo } from "../base/api/testHelper.page";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page";
import { FooterDataTablePage } from "../pages/FooterDataTable.page";
import { LONG, SHORT, STAGE } from "../base/tags";
import { deletePersonById, deleteRoleById } from "../base/testHelperDeleteTestdata";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

let personId: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht
let roleId: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const landing = new LandingPage(page);
      const startseite = new StartPage(page);
      const login = new LoginPage(page);

      await page.goto(FRONTEND_URL);
      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    const header = new HeaderPage(page);
    const landing = new LandingPage(page);
    const login = new LoginPage(page);

    await test.step(`Testdaten löschen via API`, async () => {
      if (personId) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        const startseite = new StartPage(page);
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deletePersonById(personId, page);
        personId = [];
      }
  
      if (roleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        const startseite = new StartPage(page);
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deleteRoleById(roleId, page);
        roleId = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("2 Schulen nacheinander anlegen als Landesadmin", {tag: [LONG]}, async ({ page }) => {
    const startseite = new StartPage(page);
    const schuleManagementView = new SchuleManagementViewPage(page);
    const footerDataTable = new FooterDataTablePage(page);

    // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
    const zufallsNr = faker.number.bigInt({ min: 1000, max: 9000 })
    const schulname1 = "TAuto-PW-S1-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + zufallsNr;
    const schulname2 = "TAuto-PW-S2-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + zufallsNr;
    const dienststellenNr1 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
    const dienststellenNr2 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });

    const { menue, schuleCreationView }: { menue: MenuPage; schuleCreationView: SchuleCreationViewPage } =
      await test.step(`Dialog Schule anlegen öffnen`, async (): Promise<{ menue: MenuPage; schuleCreationView: SchuleCreationViewPage }> => {
        const menue: MenuPage = await startseite.administration();
        const schuleCreationView: SchuleCreationViewPage = await menue.schuleAnlegen();
        await menue.menueItem_SchuleAnlegen.click();
        await expect(schuleCreationView.text_h2_SchuleAnlegen).toHaveText("Neue Schule hinzufügen");
        return {menue, schuleCreationView};
    });

    await test.step(`Erste Schule anlegen`, async () => {
      await schuleCreationView.radio_button_Public_Schule.click();

      await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr1);
      await schuleCreationView.input_Schulname.fill(schulname1);
      await schuleCreationView.button_SchuleAnlegen.click();
      await expect(schuleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Schule anlegen`, async () => {
      await schuleCreationView.button_WeitereSchuleAnlegen.click();
      await schuleCreationView.radio_button_Public_Schule.click();

      await schuleCreationView.input_Dienststellennummer.click();
      await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr2);

      await schuleCreationView.input_Schulname.fill(schulname2);
      await schuleCreationView.button_SchuleAnlegen.click();
      await expect(schuleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die beiden neuen Schulen angezeigt werden`, async () => {
      await menue.menueItem_AlleSchulenAnzeigen.click();
      await footerDataTable.combobox_AnzahlEintraege.click();
      await page.getByText('300', { exact: true }).click();
      await expect(schuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(page.getByRole("cell", { name: schulname1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: schulname2 })).toBeVisible();
    });
  });

  test("Ergebnisliste Schulen auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite = new StartPage(page);

    await test.step(`Schulverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      const menue: MenuPage = await startseite.administration();
      const schuleManagementView: SchuleManagementViewPage = await menue.alleSchulenAnzeigen();
      await expect(schuleManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(schuleManagementView.text_h2_Schulverwaltung).toBeVisible();
      await expect(schuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(schuleManagementView.table_header_Dienststellennummer).toBeVisible();
      await expect(schuleManagementView.table_header_Schulname).toBeVisible();
    });
  });

  test("Eine Schule anlegen als Schuladmin und die Bestätigungsseite vollständig prüfen", {tag: [LONG, SHORT]}, async ({ page }) => {

    // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
    const zufallsNr = faker.number.bigInt({ min: 1000, max: 9000 });
    const schulname = "TAuto-PW-S1-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + zufallsNr;
    const dienststellenNr = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
    const landing = new LandingPage(page);
    const header = new HeaderPage(page);
    let userInfo: UserInfo;

    const startseite: StartPage = await test.step(`Testdaten: Schuladmin anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      userInfo = await createPersonWithUserContext(page, 'Testschule Schulportal', 'LEIT', 'TAuto-PW-B-MeierLEIT', 'TAuto-PW-B-Hans', idSP, 'TAuto-PW-R-RolleLEIT');
      personId.push(userInfo.personId); 
      roleId.push(userInfo.rolleId);
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');

      await header.logout();
      const login = await landing.login();
      const startseite = await login.login(userInfo.username, userInfo.password);
      userInfo.password = await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
      return startseite
    });

    const schuleCreationView = await test.step(`Dialog Schule anlegen öffnen als Schuladmin`, async () => {
      const menue: MenuPage = await startseite.administration();
        const schuleCreationView: SchuleCreationViewPage = await menue.schuleAnlegen();
        return schuleCreationView;
    });

    const schultraeger = await test.step(`Schule anlegen`, async () => {
      const schultraeger = await schuleCreationView.radio_button_Public_Schule.innerText();
      await schuleCreationView.radio_button_Public_Schule.click();
      await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr);
      await schuleCreationView.input_Schulname.fill(schulname);
      await schuleCreationView.button_SchuleAnlegen.click();
      return schultraeger;
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(schuleCreationView.text_success).toBeVisible();
      await expect(schuleCreationView.text_h2_SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
      await expect(schuleCreationView.button_Schliessen).toBeVisible();
      await expect(schuleCreationView.text_success).toBeVisible();
      await expect(schuleCreationView.icon_success).toBeVisible();
      await expect(schuleCreationView.text_DatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
      await expect(schuleCreationView.label_Schulform).toHaveText('Schulform:');
      await expect(schuleCreationView.data_Schulform).toContainText(schultraeger);
      await expect(schuleCreationView.label_Dienststellennummer).toHaveText('Dienststellennummer:');
      await expect(schuleCreationView.data_Dienststellennummer).toHaveText(dienststellenNr);
      await expect(schuleCreationView.label_Schulname).toHaveText('Schulname:');
      await expect(schuleCreationView.data_Schulname).toHaveText(schulname);
      await expect(schuleCreationView.button_WeitereSchuleAnlegen).toBeVisible();
      await expect(schuleCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });
});
