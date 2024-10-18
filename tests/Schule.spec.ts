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
      const Landing = new LandingPage(page);
      const Startseite = new StartPage(page);
      const Login = new LoginPage(page);

      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    const Header = new HeaderPage(page);
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);

    await test.step(`Testdaten löschen via API`, async () => {
      if (personId) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        const Startseite = new StartPage(page);
        await Header.button_logout.click();
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deletePersonById(personId, page);
        personId = [];
      }
  
      if (roleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        const Startseite = new StartPage(page);
        await Header.button_logout.click();
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deleteRoleById(roleId, page);
        roleId = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test("2 Schulen nacheinander anlegen als Landesadmin", {tag: [LONG]}, async ({ page }) => {
    const Startseite = new StartPage(page);
    const SchuleManagementView = new SchuleManagementViewPage(page);
    const FooterDataTable = new FooterDataTablePage(page);

    // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
    const ZUFALLSNUMMER = faker.number.bigInt({ min: 1000, max: 9000 })
    const SCHULNAME1 = "TAuto-PW-S1-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + ZUFALLSNUMMER;
    const SCHULNAME2 = "TAuto-PW-S2-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + ZUFALLSNUMMER;
    const DIENSTSTELLENNUMMER1 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
    const DIENSTSTELLENNUMMER2 = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });

    const { Menue, SchuleCreationView }: { Menue: MenuPage; SchuleCreationView: SchuleCreationViewPage } =
      await test.step(`Dialog Schule anlegen öffnen`, async (): Promise<{ Menue: MenuPage; SchuleCreationView: SchuleCreationViewPage }> => {
        const Menue: MenuPage = await Startseite.administration();
        const SchuleCreationView: SchuleCreationViewPage = await Menue.schuleAnlegen();
        await Menue.menueItem_SchuleAnlegen.click();
        await expect(SchuleCreationView.text_h2_SchuleAnlegen).toHaveText("Neue Schule hinzufügen");
        return {Menue, SchuleCreationView};
    });

    await test.step(`Erste Schule anlegen`, async () => {
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER1);
      await SchuleCreationView.input_Schulname.fill(SCHULNAME1);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Schule anlegen`, async () => {
      await SchuleCreationView.button_WeitereSchuleAnlegen.click();
      await SchuleCreationView.radio_button_Public_Schule.click();

      await SchuleCreationView.input_Dienststellennummer.click();
      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER2);

      await SchuleCreationView.input_Schulname.fill(SCHULNAME2);
      await SchuleCreationView.button_SchuleAnlegen.click();
      await expect(SchuleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die beiden neuen Schulen angezeigt werden`, async () => {
      await Menue.menueItem_AlleSchulenAnzeigen.click();
      await FooterDataTable.combobox_AnzahlEintraege.click();
      await page.getByText('300', { exact: true }).click();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(page.getByRole("cell", { name: SCHULNAME1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: SCHULNAME2 })).toBeVisible();
    });
  });

  test("Ergebnisliste Schulen auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const Startseite = new StartPage(page);

    await test.step(`Schulverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      const Menue: MenuPage = await Startseite.administration();
      const SchuleManagementView: SchuleManagementViewPage = await Menue.alleSchulenAnzeigen();
      await expect(SchuleManagementView.text_h1_Administrationsbereich).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toBeVisible();
      await expect(SchuleManagementView.text_h2_Schulverwaltung).toHaveText("Schulverwaltung");
      await expect(SchuleManagementView.table_header_Dienststellennummer).toBeVisible();
      await expect(SchuleManagementView.table_header_Schulname).toBeVisible();
    });
  });

  test("Eine Schule anlegen als Schuladmin und die Bestätigungsseite vollständig prüfen", {tag: [LONG, SHORT]}, async ({ page }) => {

    // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
    const ZUFALLSNUMMER = faker.number.bigInt({ min: 1000, max: 9000 });
    const SCHULNAME = "TAuto-PW-S1-" + faker.lorem.word({ length: { min: 8, max: 12 }}) + ZUFALLSNUMMER;
    const DIENSTSTELLENNUMMER = "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
    const Landing = new LandingPage(page);
    const Header = new HeaderPage(page);
    let userInfo: UserInfo;

    const Startseite: StartPage = await test.step(`Testdaten: Schuladmin anlegen und mit diesem anmelden`, async () => {
      const idSP = await getSPId(page, 'Schulportal-Administration');
      userInfo = await createPersonWithUserContext(page, 'Testschule Schulportal', 'LEIT', 'TAuto-PW-B-MeierLEIT', 'TAuto-PW-B-Hans', idSP, 'TAuto-PW-R-RolleLEIT');
      personId.push(userInfo.personId); 
      roleId.push(userInfo.rolleId);
      await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');

      await Header.button_logout.click();
      const Login = await Landing.login();
      const Startseite = await Login.login(userInfo.username, userInfo.password);
      userInfo.password = await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
      return Startseite
    });

    const SchuleCreationView = await test.step(`Dialog Schule anlegen öffnen als Schuladmin`, async () => {
      const Menue: MenuPage = await Startseite.administration();
        const SchuleCreationView: SchuleCreationViewPage = await Menue.schuleAnlegen();
        return SchuleCreationView;
    });

    const schultraeger = await test.step(`Schule anlegen`, async () => {
      const schultraeger = SchuleCreationView.radio_button_Public_Schule.innerText();
      await SchuleCreationView.radio_button_Public_Schule.click();
      await SchuleCreationView.input_Dienststellennummer.fill(DIENSTSTELLENNUMMER);
      await SchuleCreationView.input_Schulname.fill(SCHULNAME);
      await SchuleCreationView.button_SchuleAnlegen.click();
      return schultraeger;
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(SchuleCreationView.text_success).toBeVisible();
      await expect(SchuleCreationView.text_h2_SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
      await expect(SchuleCreationView.button_Schliessen).toBeVisible();
      await expect(SchuleCreationView.text_success).toBeVisible();
      await expect(SchuleCreationView.icon_success).toBeVisible();
      await expect(SchuleCreationView.text_DatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
      await expect(SchuleCreationView.label_Schulform).toHaveText('Schulform:');
      await expect(SchuleCreationView.data_Schulform).toContainText(schultraeger);
      await expect(SchuleCreationView.label_Dienststellennummer).toHaveText('Dienststellennummer:');
      await expect(SchuleCreationView.data_Dienststellennummer).toHaveText(DIENSTSTELLENNUMMER);
      await expect(SchuleCreationView.label_Schulname).toHaveText('Schulname:');
      await expect(SchuleCreationView.data_Schulname).toHaveText(SCHULNAME);
      await expect(SchuleCreationView.button_WeitereSchuleAnlegen).toBeVisible();
      await expect(SchuleCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });
  });
});
