import { expect, PlaywrightTestArgs, Response, test } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { createKlasse, getOrganisationId } from '../base/api/testHelperOrganisation.page.ts';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page.ts';
import { addSystemrechtToRolle } from '../base/api/testHelperRolle.page.ts';
import { getSPId } from '../base/api/testHelperServiceprovider.page.ts';
import { klasse1Testschule } from '../base/klassen.ts';
import { landSH, testschuleDstNr, testschuleName } from '../base/organisation.ts';
import { typeLandesadmin, typeSchueler, typeSchuladmin } from '../base/rollentypen.ts';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import {
  deleteKlasseByName,
  deletePersonenBySearchStrings,
  deleteRolleById,
} from '../base/testHelperDeleteTestdata.ts';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/testHelperGenerateTestdataNames.ts';
import { KlasseCreationViewPage } from '../pages/admin/KlasseCreationView.page';
import { KlasseDetailsViewPage } from '../pages/admin/KlasseDetailsView.page.ts';
import { KlasseManagementViewPage } from '../pages/admin/KlasseManagementView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { StartPage } from '../pages/StartView.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let klasseNames: string[] = [];
let usernames: string[] = [];
let rolleIds: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);
      const login: LoginPage = new LoginPage(page);
      const startseite: StartPage = new StartPage(page);

      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }

      await landing.button_Anmelden.click();
      await login.login(ADMIN, PW);
      await startseite.validateStartPageIsLoaded();
    }

    await test.step('Testdaten löschen via API', async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }
      if (klasseNames.length > 0) {
        await deleteKlasseByName(klasseNames, page);
        klasseNames = [];
      }
      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test(
    'Eine Klasse als Landesadmin anlegen und die Klasse anschließend in der Ergebnisliste suchen und dann löschen',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
      const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
      const schulname: string = testschuleName;
      const klassenname: string = await generateKlassenname();
      klasseNames.push(klassenname)

      await test.step(`Dialog Klasse anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_KlasseAnlegen.click();
        await klasseCreationView.waitForFilterToLoad();
        await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
      });

      await test.step(`Klasse anlegen`, async () => {
        await klasseCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
        await klasseCreationView.inputKlassenname.fill(klassenname);
        await klasseCreationView.buttonKlasseAnlegen.click();
        await expect(klasseCreationView.textSuccess).toBeVisible();
      });

      await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
        await menue.menueItem_AlleKlassenAnzeigen.click();
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await klasseManagementView.comboboxFilterSchule.fill(schulname);
        await page.getByText(`${schulname}`, { exact: true }).click({ delay: 1000 });
        await klasseManagementView.textH2Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
        await expect(page.getByRole('cell', { name: klassenname })).toBeVisible();
      });

      await test.step(`Klasse löschen`, async () => {
        await page.getByRole('cell', { name: klassenname }).click();
        await page.getByTestId('open-klasse-delete-dialog-button').click();
        await page.getByTestId('klasse-delete-button').click();
        await page.getByTestId('close-klasse-delete-success-dialog-button').click();
        // wait for the last request in this test
        await page.waitForResponse((resp: Response) =>
          ['organisationen', 'typ=SCHULE', 'systemrechte=KLASSEN_VERWALTEN'].every((segment: string) =>
            resp.url().includes(segment)
          )
        );
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await expect(page.getByRole('cell', { name: 'Playwright4b' })).toBeVisible();
        await expect(page.getByRole('cell', { name: klassenname })).toBeHidden();
      });
    }
  );

  test(
    'Ergebnisliste Klassen als Landesadmin auf Vollständigkeit prüfen',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);

      await test.step(`Klassenverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        const menu: MenuPage = await startseite.goToAdministration();
        await menu.alleKlassenAnzeigen();
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await expect(klasseManagementView.textH1Administrationsbereich).toBeVisible();
        await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText('Klassenverwaltung');
        await expect(klasseManagementView.comboboxFilterSchule).toBeVisible();
        await expect(klasseManagementView.comboboxFilterKlasse).toBeVisible();
        await expect(klasseManagementView.tableHeaderDienststellennummer).toBeVisible();
        await expect(klasseManagementView.tableHeaderKlassenname).toBeVisible();
      });
    }
  );

  test(
    'Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
      const nameSchule: string = testschuleName;
      const klasseName: string = await generateKlassenname();

      await test.step(`Dialog Schule anlegen öffnen`, async () => {
        await page.goto('/' + 'admin/klassen/new');
      });

      await test.step(`Klasse anlegen`, async () => {
        await klasseCreationView.comboboxOrganisationInput.searchByTitle(nameSchule, false);
        await klasseCreationView.inputKlassenname.fill(klasseName);
        await klasseCreationView.buttonKlasseAnlegen.click();
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
        await expect(klasseCreationView.buttonSchliessen).toBeVisible();
        await expect(klasseCreationView.textSuccess).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
        klasseNames.push(klasseName);
        await expect(klasseCreationView.iconSuccess).toBeVisible();
        await expect(klasseCreationView.textDatenGespeichert).toBeVisible();
        await expect(klasseCreationView.labelSchule).toBeVisible();
        await expect(klasseCreationView.dataSchule).toHaveText(testschuleDstNr + ' (' + nameSchule + ')');
        await expect(klasseCreationView.labelKlasse).toBeVisible();
        await expect(klasseCreationView.dataKlasse).toHaveText(klasseName);
        await expect(klasseCreationView.buttonWeitereKlasseAnlegen).toBeVisible();
        await expect(klasseCreationView.buttonZurueckErgebnisliste).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const menue: MenuPage = new MenuPage(page);
      const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);

      await test.step(`Klassenverwaltung öffnen und prüfen, dass jede Klasse eine Dienststellennummer hat`, async () => {
        // Navigate to Klassenverwaltung
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItem_AlleKlassenAnzeigen.click();

        // Wait until the table is visible
        await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText('Klassenverwaltung');

        // Show first 100 entries
        await klasseManagementView.footerDataTable.combobox_AnzahlEintraege.click();
        await page.getByRole('option', { name: '100' }).click();

        await klasseManagementView.checkTableData();
        // Go to the last page
        await klasseManagementView.footerDataTable.text_LetzteSeite.click();
        await klasseManagementView.checkTableData();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test('Klasse bearbeiten als Landesadmin', { tag: [LONG, STAGE, BROWSER] }, async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);

    let userInfoAdmin: UserInfo;
    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
    const klasseDetailsView: KlasseDetailsViewPage = new KlasseDetailsViewPage(page);
    let klassenname: string = await generateKlassenname();

    await test.step(`Landesadmin anlegen`, async () => {
      const adminVorname: string = await generateVorname();
      const adminNachname: string = await generateNachname();
      const adminRolle: string = await generateRolleName();
      const adminRollenart: string = typeLandesadmin;
      const adminOrganisation: string = landSH;
      const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

      userInfoAdmin = await createRolleAndPersonWithUserContext(
        page,
        adminOrganisation,
        adminRollenart,
        adminVorname,
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

      usernames.push(userInfoAdmin.username);
      rolleIds.push(userInfoAdmin.rolleId);

      //login als Schuladmin
      await header.logout({ logoutViaStartPage: true });
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
    });

    await test.step(`Klasse anlegen`, async () => {
      await startseite.cardItemSchulportalAdministration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');

      await klasseCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
      await klasseCreationView.inputKlassenname.fill(klassenname);
      await klasseCreationView.buttonKlasseAnlegen.click();
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`Klasse bearbeiten als Landesadmin`, async () => {
      await menue.menueItem_AlleKlassenAnzeigen.click();
      await klasseCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
      await page.getByRole('cell', { name: klassenname, exact: true }).click();
      klassenname = await generateKlassenname();
      await klasseDetailsView.klasseBearbeiten(klassenname);
      await expect(klasseDetailsView.textSuccess).toBeVisible();
      klasseNames.push(klassenname);
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test('Klasse bearbeiten als Schuladmin', { tag: [LONG] }, async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);

    let userInfoAdmin: UserInfo;
    const startseite: StartPage = new StartPage(page);
    const menue: MenuPage = new MenuPage(page);
    const klasseManagementView: KlasseManagementViewPage = new KlasseManagementViewPage(page);
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(page);
    const klasseDetailsView: KlasseDetailsViewPage = new KlasseDetailsViewPage(page);
    let klassenname: string = await generateKlassenname();

    await test.step(`Schuladmin anlegen`, async () => {
      const adminVorname: string = await generateVorname();
      const adminNachname: string = await generateNachname();
      const adminRolle: string = await generateRolleName();
      const adminRollenart: string = typeSchuladmin;
      const adminOrganisation: string = testschuleName;
      const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

      userInfoAdmin = await createRolleAndPersonWithUserContext(
        page,
        adminOrganisation,
        adminRollenart,
        adminVorname,
        adminNachname,
        adminIdSPs,
        adminRolle
      );
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
      await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');

      usernames.push(userInfoAdmin.username);
      rolleIds.push(userInfoAdmin.rolleId);

      //login als Schuladmin
      currentUserIsLandesadministrator = false;
      logoutViaStartPage = true;
      await header.logout({ logoutViaStartPage: true });
      await landing.button_Anmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.updatePW();
      await startseite.validateStartPageIsLoaded();
    });

    await test.step(`Klasse anlegen`, async () => {
      await startseite.cardItemSchulportalAdministration.click();
      await menue.menueItem_KlasseAnlegen.click();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');

      await expect(klasseCreationView.comboboxSchulstrukturknoten).toContainText(testschuleName);
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
      await expect(klasseDetailsView.textSuccess).toBeVisible();
      klasseNames.push(klassenname);
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test(
    'Eine Klasse ohne zugeordnete Personen als Landesadmin via Quickaction löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
      });

      await test.step(`Generierte Klasse via Quickaction löschen`, async () => {
        await klasseManagementView.deleteRowViaQuickAction(klassenname);
      });

      await test.step(`In der Ergebnisliste Klasse prüfen, dass die Klasse nicht mehr existiert`, async () => {
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klasse1Testschule);
        await klasseManagementView.checkRowNotExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse ohne zugeordnete Personen als Schuladmin via Quickaction löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let userInfoAdmin: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      await test.step(`Schuladmin anlegen`, async () => {
        const adminVorname: string = await generateVorname();
        const adminNachname: string = await generateNachname();
        const adminRolleName: string = await generateRolleName();
        const adminRollenart: string = typeSchuladmin;
        const adminOrganisation: string = testschuleName;
        const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          adminOrganisation,
          adminRollenart,
          adminVorname,
          adminNachname,
          adminIdSPs,
          adminRolleName
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');

        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);

        // login als Schuladmin
        const header: HeaderPage = new HeaderPage(page);
        logoutViaStartPage = true;
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: true });
        const loginPage: LoginPage = await landingPage.goToLogin();
        await loginPage.login(userInfoAdmin.username, userInfoAdmin.password);
        await loginPage.updatePW();
        currentUserIsLandesadministrator = false;
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();
          klasseManagementView.setCurrentUserIsLandesadministrator(currentUserIsLandesadministrator);

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.checkRowExists(klassenname);
      });

      await test.step(`Generierte Klasse via Quickaction löschen`, async () => {
        await klasseManagementView.deleteRowViaQuickAction(klassenname);
      });

      await test.step(`In der Ergebnisliste Klasse prüfen, dass´die Klasse nicht mehr existiert`, async () => {
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await klasseManagementView.checkRowExists(klasse1Testschule);
        await klasseManagementView.checkRowNotExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse mit einem zugeordneten Schüler als Landesadmin via Quickaction löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let klasseId: string;
      let userInfoSchueler: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        klasseId = await createKlasse(page, idSchule, klassenname);
      });

      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = await generateVorname();
        const schuelerNachname: string = await generateNachname();
        const schuelerRolleName: string = await generateRolleName();
        const schuelerRollenart: string = typeSchueler;
        const schuelerIdSPs: string[] = [await getSPId(page, 'itslearning')];

        userInfoSchueler = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          schuelerRollenart,
          schuelerVorname,
          schuelerNachname,
          schuelerIdSPs,
          schuelerRolleName,
          undefined,
          klasseId
        );

        usernames.push(userInfoSchueler.username);
        rolleIds.push(userInfoSchueler.rolleId);
        klasseNames.push(klassenname);
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
      });

      await test.step(`Prüfen, dass die generierte Klasse via Quickaction nicht gelöscht werden kann`, async () => {
        await klasseManagementView.clickIconTableRowLoeschen(klassenname);
        await klasseManagementView.clickButtonLoeschen();
        await klasseManagementView.checkDeleteClassFailed();
        await klasseManagementView.clickButtonCloseAlert();
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse ohne zugeordnete Personen als Landesadmin via Gesamtübersicht löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
      });

      await test.step(`Gesamtübersicht öffnen und generierte Klasse löschen`, async () => {
        const KlasseDetailsViewPage: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(
          klassenname
        );
        await KlasseDetailsViewPage.deleteClass();
      });

      await test.step(`In der Ergebnisliste Klasse prüfen, dass´die Klasse nicht mehr existiert`, async () => {
        await klasseManagementView.checkRowExists(klasse1Testschule);
        await klasseManagementView.checkRowNotExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse ohne zugeordnete Personen als Schuladmin via Gesamtübersicht löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let userInfoAdmin: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      await test.step(`Schuladmin anlegen`, async () => {
        const adminVorname: string = await generateVorname();
        const adminNachname: string = await generateNachname();
        const adminRolleName: string = await generateRolleName();
        const adminRollenart: string = typeSchuladmin;
        const adminOrganisation: string = testschuleName;
        const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];

        userInfoAdmin = await createRolleAndPersonWithUserContext(
          page,
          adminOrganisation,
          adminRollenart,
          adminVorname,
          adminNachname,
          adminIdSPs,
          adminRolleName
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');

        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);

        // login als Schuladmin
        const header: HeaderPage = new HeaderPage(page);
        const landingPage: LandingPage = await header.logout({ logoutViaStartPage: true });
        const loginPage: LoginPage = await landingPage.goToLogin();
        await loginPage.login(userInfoAdmin.username, userInfoAdmin.password);
        await loginPage.updatePW();
        currentUserIsLandesadministrator = false;
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();
          klasseManagementView.setCurrentUserIsLandesadministrator(currentUserIsLandesadministrator);

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.checkRowExists(klassenname);
      });

      await test.step(`Gesamtübersicht öffnen und generierte Klasse löschen`, async () => {
        const KlasseDetailsViewPage: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(
          klassenname
        );
        await KlasseDetailsViewPage.deleteClass();
      });

      await test.step(`In der Ergebnisliste Klasse prüfen, dass´die Klasse nicht mehr existiert`, async () => {
        await klasseManagementView.checkRowExists(klasse1Testschule);
        await klasseManagementView.checkRowNotExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse mit einem zugeordneten Schüler als Landesadmin via Gesamtübersicht löschen',
    { tag: [LONG, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const klassenname: string = await generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let klasseId: string;
      let userInfoSchueler: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        klasseId = await createKlasse(page, idSchule, klassenname);
      });

      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = await generateVorname();
        const schuelerNachname: string = await generateNachname();
        const schuelerRolleName: string = await generateRolleName();
        const schuelerRollenart: string = typeSchueler;
        const schuelerIdSPs: string[] = [await getSPId(page, 'itslearning')];

        userInfoSchueler = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          schuelerRollenart,
          schuelerVorname,
          schuelerNachname,
          schuelerIdSPs,
          schuelerRolleName,
          undefined,
          klasseId
        );

        usernames.push(userInfoSchueler.username);
        rolleIds.push(userInfoSchueler.rolleId);
        klasseNames.push(klassenname);
      });

      const klasseManagementView: KlasseManagementViewPage =
        await test.step(`In die Ergebnisliste Klasse navigieren und nach der Testschule filtern`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
        await klasseManagementView.waitErgebnislisteIsLoaded();
      });

      await test.step(`Gesamtübersicht öffnen und prüfen, dass die Klasse nicht gelöscht werden kann`, async () => {
        const KlasseDetailsViewPage: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(
          klassenname
        );
        await KlasseDetailsViewPage.startDeleteRowViaQuickAction();
        await klasseManagementView.checkDeleteClassFailed();
        await klasseManagementView.clickButtonCloseAlert();
        await klasseManagementView.waitErgebnislisteIsLoaded();
        await klasseManagementView.filterSchule(testschuleName);
        await klasseManagementView.checkRowExists(klassenname);
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
