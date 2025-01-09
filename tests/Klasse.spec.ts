import { test, expect } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { KlasseCreationViewPage } from "../pages/admin/KlasseCreationView.page";
import { KlasseManagementViewPage } from "../pages/admin/KlasseManagementView.page";
import { HeaderPage } from "../pages/Header.page";
import { LONG, SHORT, STAGE, BROWSER } from "../base/tags";
import { deleteKlasseByName, deletePersonenBySearchStrings, deleteRolleById } from "../base/testHelperDeleteTestdata.ts";
import { landSH, testschule } from "../base/organisation.ts";
import {
  generateKlassenname,
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname
} from '../base/testHelperGenerateTestdataNames.ts';
import { createPersonWithUserContext, createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page.ts';
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page.ts";
import { getSPId } from "../base/api/testHelperServiceprovider.page.ts";
import { KlasseDetailsViewPage } from "../pages/admin/KlasseDetailsView.page.ts";
import { UserInfo } from "../base/api/testHelper.page.ts";
import { createKlasse, getOrganisationId } from '../base/api/testHelperOrganisation.page.ts';
import { schuelerRolle } from '../base/rollen';
import { KlasseDeletionErrorPage } from '../pages/admin/KlasseDeletionError.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let klassenNames: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
  let userNames: string[] = [];
  let rollenIds: string[] = [];

  test.beforeEach(async ({ page }) => {
    await test.step(`Login`, async () => {
      const landing: LandingPage = new LandingPage(page);
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);

      await page.goto('/');
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
    await test.step(`Testdaten löschen via API`, async () => {
      if (klassenNames) {
        // nur wenn der Testfall auch mind. eine Klasse angelegt hat
        await deleteKlasseByName(klassenNames, page);
        klassenNames = [];
      }
      if (userNames) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();

        await deletePersonenBySearchStrings(page, userNames);
        userNames = [];
      }
      if (rollenIds) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();

        await deleteRolleById(rollenIds, page);
        rollenIds = [];
      }

    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Klasse anschließend in der Ergebnisliste suchen und dann löschen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
    const schulname: string = testschule;
    const klassenname: string = await generateKlassenname();

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText("Neue Klasse hinzufügen");
    });

    await test.step(`Klasse anlegen`, async () => {
      await klasseCreationView.comboboxSchulstrukturknoten.click();
      await page.getByText(schulname).click();
      await klasseCreationView.inputKlassenname.fill(klassenname);
      await klasseCreationView.buttonKlasseAnlegen.click();
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await klasseManagementView.comboboxFilterSchule.fill(schulname);
      await page.getByText(`${schulname}`, { exact: true }).click({delay:1000});
      await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });

    await test.step(`Klasse löschen`, async () => {
      await page.getByRole('cell', { name: klassenname }).click();
      await page.getByTestId('open-klasse-delete-dialog-button').click();
      await page.getByTestId('klasse-delete-button').click();
      await page.getByTestId('close-klasse-delete-success-dialog-button').click();
    });
  });

  test("Ergebnisliste Klassen als Landesadmin auf Vollständigkeit prüfen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite: StartPage = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);

    await test.step(`Klassenverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(klasseManagementView.textH1Administrationsbereich).toBeVisible();
      await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");
      await expect(klasseManagementView.comboboxFilterSchule).toBeVisible();
      await expect(klasseManagementView.comboboxFilterKlasse).toBeVisible();
      await expect(klasseManagementView.tableHeaderDienststellennummer).toBeVisible();
      await expect(klasseManagementView.tableHeaderKlassenname).toBeVisible();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen", {tag: [LONG, STAGE, BROWSER]}, async ({ page }) => {
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
    const dienststellennummer: string = '1111111';
    const nameSchule: string = testschule;
    const klasseName: string = await generateKlassenname();

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await page.goto('/' + 'admin/klassen/new');
    });

    await test.step(`Klasse anlegen`, async () => {
      await klasseCreationView.comboboxSchulstrukturknoten.click();
      await page.getByText(nameSchule).click();
      await klasseCreationView.inputKlassenname.fill(klasseName);
      await klasseCreationView.buttonKlasseAnlegen.click();
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
      await expect(klasseCreationView.buttonSchliessen).toBeVisible();
      await expect(klasseCreationView.textSuccess).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
      klassenNames.push(klasseName);
      await expect(klasseCreationView.iconSuccess).toBeVisible();
      await expect(klasseCreationView.textDatenGespeichert).toBeVisible();
      await expect(klasseCreationView.labelSchule).toBeVisible();
      await expect(klasseCreationView.dataSchule).toHaveText(dienststellennummer + ' (' + nameSchule + ')');
      await expect(klasseCreationView.labelKlasse).toBeVisible();
      await expect(klasseCreationView.dataKlasse).toHaveText(klasseName);
      await expect(klasseCreationView.buttonWeitereKlasseAnlegen).toBeVisible();
      await expect(klasseCreationView.buttonZurueckErgebnisliste).toBeVisible();
    });
  });

  test("Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)", { tag: [LONG, SHORT, STAGE] }, async ({ page }) => {
    const startseite: StartPage = new StartPage(page);
    const menue:MenuPage = new MenuPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);

    await test.step(`Klassenverwaltung öffnen und prüfen, dass jede Klasse eine Dienststellennummer hat`, async () => {
      // Navigate to Klassenverwaltung
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();

      // Wait until the table is visible
      await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");

      // Show first 100 entries
      await klasseManagementView.footerDataTable.combobox_AnzahlEintraege.click();
      await page.getByRole('option', { name: '100' }).click();

      await klasseManagementView.checkTableData();
      // Go to the last page
      await klasseManagementView.footerDataTable.text_LetzteSeite.click();
      await klasseManagementView.checkTableData();
    });
  });
  test('Klasse bearbeiten als Landesadmin', { tag: [LONG] }, async ({ page }) => {
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);

    let userInfoAdmin: UserInfo;
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);
    const klasseCreationView = new KlasseCreationViewPage(page);
    const klasseDetailsView = new KlasseDetailsViewPage(page);
    const schulname = testschule;
    let klassenname = await generateKlassenname();

    await test.step(`Landesadmin anlegen`, async () => {
      const addminVorname = await generateVorname();
      const adminNachname = await generateNachname();
      const adminRolle = await generateRolleName();
      const adminRollenart = 'SYSADMIN';
      const adminOrganisation = landSH;
      const adminIdSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];

      userInfoAdmin = await createRolleAndPersonWithUserContext(
        page,
        adminOrganisation,
        adminRollenart,
        addminVorname,
        adminNachname,
        adminIdSPs,
        adminRolle
      );
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'ROLLEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULTRAEGER_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_ANLEGEN');

      userNames.push(userInfoAdmin.username);
      rollenIds.push(userInfoAdmin.rolleId);

      //login als Schuladmin
      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });

    await test.step(`Klasse anlegen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');

      await klasseCreationView.comboboxSchulstrukturknoten.click();
      await page.getByText(schulname).click();
      await klasseCreationView.inputKlassenname.fill(klassenname);
      await klasseCreationView.buttonKlasseAnlegen.click();
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`Klasse bearbeiten als Landesadmin`, async () => {
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await klasseManagementView.comboboxFilterSchule.fill(schulname);
      await page.getByText(`${schulname}`, { exact: true }).click();
      await klasseManagementView.comboboxFilterKlasse.fill(klassenname);
      await page.getByRole('cell', { name: klassenname, exact: true }).click();
      klassenname = await generateKlassenname();
      await klasseDetailsView.klasseBearbeiten(klassenname);
      await expect(klasseDetailsView.text_success).toBeVisible();
      klassenNames.push(klassenname);
    });
  });
  test('Klasse bearbeiten als Schuladmin', { tag: [LONG] }, async ({ page }) => {
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);

    let userInfoAdmin: UserInfo;
    const startseite = new StartPage(page);
    const menue = new MenuPage(page);
    const klasseManagementView = new KlasseManagementViewPage(page);
    const klasseCreationView = new KlasseCreationViewPage(page);
    const klasseDetailsView = new KlasseDetailsViewPage(page);
    const schulname = testschule;
    let klassenname = await generateKlassenname();

    await test.step(`Schuladmin anlegen`, async () => {
      const addminVorname = await generateVorname();
      const adminNachname = await generateNachname();
      const adminRolle = await generateRolleName();
      const adminRollenart = 'LEIT';
      const adminOrganisation = testschule;
      const adminIdSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];;

      userInfoAdmin = await createRolleAndPersonWithUserContext(
        page,
        adminOrganisation,
        adminRollenart,
        addminVorname,
        adminNachname,
        adminIdSPs,
        adminRolle
      );
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');

      userNames.push(userInfoAdmin.username);
      rollenIds.push(userInfoAdmin.rolleId);

      //login als Schuladmin
      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });

    await test.step(`Klasse anlegen`, async () => {
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');

      await expect(klasseCreationView.comboboxSchulstrukturknoten).toContainText(testschule);
      await klasseCreationView.inputKlassenname.fill(klassenname);
      await klasseCreationView.buttonKlasseAnlegen.click();
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`Klasse bearbeiten als Schuladmin`, async () => {
      await page.goto('/admin/klassen');
      await klasseManagementView.comboboxFilterKlasse.fill(klassenname);
      await page.getByRole('cell', { name: klassenname, exact: true }).click();
      klassenname = await generateKlassenname();
      await klasseDetailsView.klasseBearbeiten(klassenname);
      await expect(klasseDetailsView.text_success).toBeVisible();
      klassenNames.push(klassenname);
    });
  });

  test("Eine Klasse ohne zugeordnete Personen als Landesadmin via Quickaction löschen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
    const schulname: string = testschule;
    const klassenname: string = await generateKlassenname();

    await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
      const schuleId: string = await getOrganisationId(page, schulname);
      await createKlasse(
        page,
        klassenname,
        schuleId,
        schuleId,
      );
      // SKIP ADDING to klassenNames-array because afterEach-hook cannot delete a class that is already deleted in the test itself
      //klassenNames.push(klassenname);
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");
    });

    await test.step(`In Ergebnisliste prüfen, dass generierte Klasse angezeigt wird`, async () => {
      await klasseManagementView.comboboxFilterSchule.fill(`${schulname}`, {});
      await page.getByText(`${schulname}`, { exact: true }).click({delay:1000});
      await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });

    await test.step(`Generierte Klasse via Quickaction löschen`, async () => {
      await page.getByRole('cell', { name: klassenname }).click();
      await page.getByTestId('open-klasse-delete-dialog-button').click();
      await page.getByTestId('klasse-delete-button').click();
      await page.getByTestId('close-klasse-delete-success-dialog-button').click();
    });
  });

  test("Eine Klasse mit zugeordneter Lehrkraft als Landesadmin via Quickaction löschen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
    const klassenDeletionErrorPage: KlasseDeletionErrorPage = new KlasseDeletionErrorPage(page);
    const schulname: string = testschule;
    const klassenname: string = await generateKlassenname();

    await test.step('Klasse zum Löschen via Quickaction generieren und Schüler zuordnen', async () => {
      const schuleId: string = await getOrganisationId(page, schulname);
      await createKlasse(
        page,
        klassenname,
        schuleId,
        schuleId,
      );
      // SKIP ADDING to klassenNames-array because afterEach-hook cannot delete a class that is already deleted in the test itself
      //klassenNames.push(klassenname);
      const userInfoSchueler: UserInfo = await createPersonWithUserContext(page, klassenname, await generateNachname(), await generateVorname(), schuelerRolle, await generateKopersNr());
      userNames.push(userInfoSchueler.username);
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");
    });

    await test.step(`In Ergebnisliste prüfen, dass generierte Klasse angezeigt wird`, async () => {
      await klasseManagementView.comboboxFilterSchule.fill(`${schulname}`, {});
      await page.getByText(`${schulname}`, { exact: true }).click({delay:1000});
      await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });

    await test.step(`Generierte Klasse via Quickaction löschen nicht möglich`, async () => {
      await page.getByRole('cell', { name: klassenname }).click();
      await page.getByTestId('open-klasse-delete-dialog-button').click();
      await page.getByTestId('klasse-delete-button').click();

      await expect(klassenDeletionErrorPage.text_title_error).toHaveText("Fehler beim Löschen");
      await expect(klassenDeletionErrorPage.text_message_error).toHaveText("Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.");
    });
  });

  test("Eine Klasse ohne zugeordnete Personen als Schuladmin via Quickaction löschen", {tag: [LONG, SHORT, STAGE]}, async ({ page }) => {
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);
    let userInfoAdmin: UserInfo;

    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
    const schulname: string = testschule;
    const klassenname: string = await generateKlassenname();

    await test.step(`Schuladmin anlegen`, async () => {
      const addminVorname = await generateVorname();
      const adminNachname = await generateNachname();
      const adminRolle = await generateRolleName();
      const adminRollenart = 'LEIT';
      const adminOrganisation = testschule;
      const adminIdSP = await getSPId(page, 'Schulportal-Administration');

      userInfoAdmin = await createRolleAndPersonWithUserContext(
        page,
        adminOrganisation,
        adminRollenart,
        addminVorname,
        adminNachname,
        [adminIdSP],
        adminRolle
      );
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');

      userNames.push(userInfoAdmin.username);
      rollenIds.push(userInfoAdmin.rolleId);

      //login als Schuladmin
      await header.logout();
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.UpdatePW();
      await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    });

    await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
      const schuleId: string = await getOrganisationId(page, schulname);
      await createKlasse(
        page,
        klassenname,
        schuleId,
        schuleId,
      );
      // SKIP ADDING to klassenNames-array because afterEach-hook cannot delete a class that is already deleted in the test itself
      //klassenNames.push(klassenname);
      await startseite.card_item_schulportal_administration.click();
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");
    });

   /* await test.step(`In Ergebnisliste prüfen, dass generierte Klasse angezeigt wird`, async () => {
      await klasseManagementView.comboboxFilterSchule.fill(`${schulname}`, {});
      await page.getByText(`${schulname}`, { exact: true }).click({delay:1000});
      await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });*/
    await test.step(`In Ergebnisliste prüfen, dass generierte Klasse angezeigt wird`, async () => {
      await klasseManagementView.combboxFilterSchule.inputElement.selectByTitle(`${schulname}`);
      await klasseManagementView.combboxFilterSchule.inputElement.closeModal();
      //await page.getByText(`${schulname}`, { exact: true }).click({delay:1000});
      await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
    });

    await test.step(`Generierte Klasse via Quickaction löschen`, async () => {
      await page.getByRole('cell', { name: klassenname }).click();
      await page.getByTestId('open-klasse-delete-dialog-button').click();
      await page.getByTestId('klasse-delete-button').click();
      await page.getByTestId('close-klasse-delete-success-dialog-button').click();
    });
  });

});