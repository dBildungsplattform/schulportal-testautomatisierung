import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../base/api/personApi';
import { createKlasse, getOrganisationId } from '../base/api/organisationApi';
import { addSystemrechtToRolle, RollenArt } from '../base/api/rolleApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import { klasse1Testschule } from '../base/klassen';
import { landSH, testschuleDstNr, testschuleName } from '../base/organisation';
import { typeLandesadmin, typeSchueler, typeSchuladmin } from '../base/rollentypen';
import { schulportaladmin } from '../base/sp';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import {
  deleteKlasseByName,
  deletePersonenBySearchStrings,
  deleteRolleById,
} from '../base/testHelperDeleteTestdata';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/utils/generateTestdata';
import { KlasseCreationViewPage } from '../pages/admin/organisationen/klassen/KlasseCreationView.page';
import { KlasseDetailsViewPage } from '../pages/admin/organisationen/klassen/details/KlasseDetailsView.page';
import { KlasseManagementViewPage } from '../pages/admin/organisationen/klassen/KlasseManagementView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/components/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/components/MenuBar.page';
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
        .then((startseite: StartPage) => {
          return startseite;
        });
      await startPage.checkSpIsVisible([schulportaladmin]);
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

      await landing.buttonAnmelden.click();
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
      const klassenname: string = generateKlassenname();
      klasseNames.push(klassenname);

      await test.step(`Dialog Klasse anlegen öffnen`, async () => {
        await startseite.cardItemSchulportalAdministration.click();
        await menue.menueItemKlasseAnlegen.click();
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
        await menue.menueItemAlleKlassenAnzeigen.click();
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
      const klasseManagementView: KlasseManagementViewPage = await test.step('Klassenverwaltung öffnen', async () => {
        const startseite: StartPage = new StartPage(page);
        const menu: MenuPage = await startseite.goToAdministration();
        const klasseManagementView: KlasseManagementViewPage = await menu.alleKlassenAnzeigen();
        await klasseManagementView.waitErgebnislisteIsLoaded();
        return klasseManagementView;
      });

      await test.step(`Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        await expect(klasseManagementView.textH1Administrationsbereich).toBeVisible();
        await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText('Klassenverwaltung');
        await expect(klasseManagementView.comboboxFilterSchule).toBeVisible();
        await expect(klasseManagementView.klasseInput).toBeVisible();
        await expect(klasseManagementView.tableHeaderDienststellennummer).toBeVisible();
        await expect(klasseManagementView.tableHeaderKlassenname).toBeVisible();
      });

      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      const klasseName: string = generateKlassenname();

      const klasseCreationView: KlasseCreationViewPage = await test.step(`Dialog Klasse anlegen öffnen`, async () => {
        const startseite: StartPage = new StartPage(page);
        const menu: MenuPage = await startseite.goToAdministration();
        const klasseCreationView: KlasseCreationViewPage = await menu.klasseAnlegen();
        return klasseCreationView;
      });

      await test.step(`Klasse anlegen`, async () => {
        await klasseCreationView.filterSchule(testschuleName);
        await klasseCreationView.comboboxOrganisationInput.searchByTitle(testschuleName, false);
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
        await expect(klasseCreationView.dataSchule).toHaveText(testschuleDstNr + ' (' + testschuleName + ')');
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
        await menue.menueItemAlleKlassenAnzeigen.click();

        // Wait until the table is visible
        await expect(klasseManagementView.textH2Klassenverwaltung).toHaveText('Klassenverwaltung');

        // Show first 100 entries
        await klasseManagementView.footerDataTable.comboboxAnzahlEintraege.click();
        await page.getByRole('option', { name: '100' }).click();

        await klasseManagementView.checkTableData();
        // Go to the last page
        await klasseManagementView.footerDataTable.textLetzteSeite.click();
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
    let klassenname: string = generateKlassenname();

    await test.step(`Landesadmin anlegen`, async () => {
      const adminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const adminRolle: string = generateRolleName();
      const adminRollenart: RollenArt = typeLandesadmin;
      const adminOrganisation: string = landSH;
      const adminIdSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

      userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
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
      await header.logout({ logoutViaStartPage: false });
    });

    await test.step(`Login als Landesadmin`, async () => {
      await landing.buttonAnmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.updatePW();
      currentUserIsLandesadministrator = false;
      await startseite.validateStartPageIsLoaded();
    });

    const menu: MenuPage = await startseite.goToAdministration();

    await test.step(`Klasse anlegen`, async () => {
      const klasseCreationView: KlasseCreationViewPage = await menu.klasseAnlegen();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');
      await klasseCreationView.createKlasse(testschuleName, klassenname);
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`Klasse bearbeiten als Landesadmin`, async () => {
      const klasseManagementView: KlasseManagementViewPage = await menu.alleKlassenAnzeigen();
      await klasseManagementView.filterSchule(testschuleName);
      const klasseDetailsView: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(klassenname);
      klassenname = generateKlassenname();
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
    const menu: MenuPage = new MenuPage(page);
    let klassenname: string = generateKlassenname();

    await test.step(`Schuladmin anlegen`, async () => {
      const adminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const adminRolle: string = generateRolleName();
      const adminRollenart: RollenArt = typeSchuladmin;
      const adminOrganisation: string = testschuleName;
      const adminIdSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

      userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
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
      logoutViaStartPage = true;
      await header.logout({ logoutViaStartPage: false });
    });

    await test.step(`Als Schuladmin anmelden`, async () => {
      currentUserIsLandesadministrator = false;
      await landing.buttonAnmelden.click();
      await login.login(userInfoAdmin.username, userInfoAdmin.password);
      await login.updatePW();
      await startseite.validateStartPageIsLoaded();
    });

    await test.step(`Klasse anlegen`, async () => {
      await startseite.goToAdministration();
      const klasseCreationView: KlasseCreationViewPage = await menu.klasseAnlegen();
      await expect(klasseCreationView.textH2KlasseAnlegen).toHaveText('Neue Klasse hinzufügen');

      await expect(klasseCreationView.comboboxSchulstrukturknoten).toContainText(testschuleName);
      await klasseCreationView.inputKlassenname.fill(klassenname);
      await klasseCreationView.buttonKlasseAnlegen.click();
      await expect(klasseCreationView.textSuccess).toBeVisible();
    });

    await test.step(`Klasse bearbeiten als Schuladmin`, async () => {
      const klasseManagementView: KlasseManagementViewPage = await menu.alleKlassenAnzeigen();
      klasseManagementView.setCurrentUserIsLandesadministrator(false);
      await klasseManagementView.waitErgebnislisteIsLoaded();
      await klasseManagementView.filterKlasse(klassenname);
      const klasseDetailsView: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(klassenname);
      klassenname = generateKlassenname();
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
      const klassenname: string = generateKlassenname();
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
      const klassenname: string = generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let userInfoAdmin: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      const landingPage: LandingPage = await test.step(`Schuladmin anlegen`, async () => {
        const adminVorname: string = generateVorname();
        const adminNachname: string = generateNachname();
        const adminRolleName: string = generateRolleName();
        const adminRollenart: RollenArt = typeSchuladmin;
        const adminOrganisation: string = testschuleName;
        const adminIdSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
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

        const header: HeaderPage = new HeaderPage(page);
        logoutViaStartPage = true;
        return await header.logout({ logoutViaStartPage: false });
      });

      await test.step(`Login als Schuladmin`, async () => {
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
      const klassenname: string = generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let klasseId: string;
      let userInfoSchueler: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        klasseId = await createKlasse(page, idSchule, klassenname);
      });

      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = generateVorname();
        const schuelerNachname: string = generateNachname();
        const schuelerRolleName: string = generateRolleName();
        const schuelerRollenart: RollenArt = typeSchueler;
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, 'itslearning')];

        userInfoSchueler = await createRolleAndPersonWithPersonenkontext(
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
        await test.step(`In die Ergebnisliste Klasse navigieren`, async () => {
          const startseite: StartPage = new StartPage(page);
          const menue: MenuPage = await startseite.goToAdministration();
          const klasseManagementView: KlasseManagementViewPage = await menue.alleKlassenAnzeigen();

          await klasseManagementView.waitErgebnislisteIsLoaded();
          return klasseManagementView;
        });

      await test.step(`Nach der Testschule filtern`, async () => {
        await klasseManagementView.filterSchule(testschuleName);
      });

      await test.step(`In Ergebnisliste prüfen, dass die generierte Klasse angezeigt wird`, async () => {
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
      const klassenname: string = generateKlassenname();
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
      const klassenname: string = generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let userInfoAdmin: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        await createKlasse(page, idSchule, klassenname);
        klasseNames.push(klassenname);
      });

      const landingPage: LandingPage = await test.step(`Schuladmin anlegen`, async () => {
        const adminVorname: string = generateVorname();
        const adminNachname: string = generateNachname();
        const adminRolleName: string = generateRolleName();
        const adminRollenart: RollenArt = typeSchuladmin;
        const adminOrganisation: string = testschuleName;
        const adminIdSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
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
        const header: HeaderPage = new HeaderPage(page);
        return await header.logout({ logoutViaStartPage: false });
      });

      await test.step(`Login als Schuladmin`, async () => {
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
      const klassenname: string = generateKlassenname();
      const idSchule: string = await getOrganisationId(page, testschuleName);
      let klasseId: string;
      let userInfoSchueler: UserInfo;

      await test.step('Klasse zum Löschen via Quickaction generieren', async () => {
        klasseId = await createKlasse(page, idSchule, klassenname);
      });

      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = generateVorname();
        const schuelerNachname: string = generateNachname();
        const schuelerRolleName: string = generateRolleName();
        const schuelerRollenart: RollenArt = typeSchueler;
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, 'itslearning')];

        userInfoSchueler = await createRolleAndPersonWithPersonenkontext(
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
        const klasseDetailsViewPage: KlasseDetailsViewPage = await klasseManagementView.openDetailViewClass(
          klassenname
        );
        await klasseDetailsViewPage.startDeleteRowViaQuickAction();
        await klasseDetailsViewPage.checkDeleteClassFailed();
        await klasseDetailsViewPage.clickButtonCloseAlert();
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
