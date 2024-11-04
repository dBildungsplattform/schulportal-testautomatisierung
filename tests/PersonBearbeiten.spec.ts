import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page.ts";
import { LoginPage } from "../pages/LoginView.page.ts";
import { StartPage } from "../pages/StartView.page.ts";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page.ts";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page.ts";
import { HeaderPage } from "../pages/Header.page.ts";
import { faker } from "@faker-js/faker/locale/de";
import { createRolleAndPersonWithUserContext } from "../base/api/testHelperPerson.page.ts";
import { getSPId } from "../base/api/testHelperServiceprovider.page.ts";
import { UserInfo } from "../base/api/testHelper.page.ts";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page.ts";
import { LONG, STAGE } from "../base/tags.ts";
import { deletePersonByUsername, deleteRoleById } from "../base/testHelperDeleteTestdata.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

let username: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht
let roleId: string[] = []; // Im afterEchh Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
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
    const startseite = new StartPage(page);

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        
        await deletePersonByUsername(username, page);
        username = [];
      }

      if (roleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
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

  test("Eine Schulzuordnung bei einem bestehenden Benutzer hinzufügen", {tag: [LONG, STAGE]}, async ({ page }) => {
    const personManagementView = new PersonManagementViewPage(page);
    const PersonDetailsView = new PersonDetailsViewPage(page);
    const header = new HeaderPage(page);
    const landing = new LandingPage(page);
    const login = new LoginPage(page);
    const startseite = new StartPage(page);

    const addminVorname = "TAuto-PW-V-" + faker.person.firstName();
    const adminNachname = "TAuto-PW-N-" + faker.person.lastName();
    const adminRolle = "TAuto-PW-LEIT-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const adminRollenart = 'LEIT';
    const adminOrganisation = 'Testschule-PW665';
    const adminIdSP = await getSPId(page, 'Schulportal-Administration');
    let userInfoAdmin: UserInfo;

    const lehrerVorname = "TAuto-PW-V-" + faker.person.firstName();
    const lehrerNachname = "TAuto-PW-N-" + faker.person.lastName();
    const lehrerRolle = "TAuto-PW-LEHR-" + faker.lorem.word({ length: { min: 8, max: 12 }});
    const lehrerRollenart = 'LEHR';
    const lehrerOrganisation = 'Testschule-PW665';
    const lehrerIdSP = await getSPId(page, 'E-Mail');
    let userInfoLehrer: UserInfo;
    let lehrerBeenutzername = '';
    const rolle = 'LiV';
    const kopersNr = faker.number.bigInt({ min: 100000, max: 900000 }).toString();

    await test.step(`Einen Schuladmin und einen zu bearbeitenden Lehrer mit je einer einer Schulzuordnung(Schule ist an einer Position > 25 in der DB) über die api anlegen und mit diesem Schuladmin anmelden`, async () => {
      // Schuladmin
      userInfoAdmin = await createRolleAndPersonWithUserContext(page, adminOrganisation, adminRollenart, addminVorname, adminNachname, adminIdSP, adminRolle);
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
      username.push(userInfoAdmin.username);
      roleId.push(userInfoAdmin.rolleId);

      // Lehrer
      userInfoLehrer = await createRolleAndPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, lehrerIdSP, lehrerRolle);
      username.push(userInfoLehrer.username);
      roleId.push(userInfoLehrer.rolleId);
      lehrerBeenutzername = userInfoLehrer.username;

      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Die Gesamtübersicht des Lehrers öffnen`, async () => {
      await page.goto(FRONTEND_URL + "admin/personen");
      await personManagementView.input_Suchfeld.fill(lehrerBeenutzername);
      await personManagementView.button_Suchen.click();
      await page.getByRole("cell", { name: lehrerBeenutzername, exact: true }).click();
    });

    await test.step(`Eine zweite Schulzuordnung hinzufügen`, async () => {
      await PersonDetailsView.button_editSchoollAssignment.click();
      await PersonDetailsView.button_addSchoollAssignment.click();
      expect(await PersonDetailsView.combobox_organisation.innerText()).toContain(adminOrganisation);
      await PersonDetailsView.combobox_rolle.click();
      await page.getByText(rolle, { exact: true }).click();
      await PersonDetailsView.input_kopersNr.fill(kopersNr);
      await PersonDetailsView.button_addSchoollAssignmentSubmit.click();
      await PersonDetailsView.button_confirmAddSchoollAssignment.click();
      await PersonDetailsView.button_saveAssignmentChanges.click();
      await PersonDetailsView.button_closeSaveAssignmentChanges.click();
    });

    await test.step(`In der Gesamtübersicht die neue Schulzuordnung prüfen`, async () => {
      await expect(page.getByTestId('person-details-card')).toContainText('1111165 (Testschule-PW665): LiV (befristet bis');
      await expect(page.getByTestId('person-details-card')).toContainText('1111165 (Testschule-PW665): ' + lehrerRolle);
    });
  })
});