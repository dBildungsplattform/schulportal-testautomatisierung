import { PlaywrightTestArgs, test } from '@playwright/test';
import { DEV, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { landSH } from '../../base/organisation';
import { landesadminRolle } from '../../base/rollen'
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { generateDienststellenNr, generateSchulname } from '../../base/utils/generateTestdata';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { SchuleManagementViewPage } from '../../pages/admin/organisationen/schulen/SchuleManagementView.neu.page';

test.describe(`Testfälle für das Anlegen von Schulen als Landesadmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let header: HeaderPage;
  let landingPage: LandingViewPage;
  let loginPage: LoginViewPage;
  let personManagementViewPage: PersonManagementViewPage;
  let schuleCreationPage : SchuleCreationViewPage;
  let landesadmin: UserInfo;
  let schuleCreationSuccessPage : SchuleCreationSuccessPage;
  let schuleManagementViewPage : SchuleManagementViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);

    landesadmin = await createPersonWithPersonenkontext(page, landSH, landesadminRolle);

    landingPage = await header.logout();
    landingPage.navigateToLogin();

    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(landesadmin.username, landesadmin.password)
    await startPage.waitForPageLoad();

    // Navigation zur Anlage von Schulen
    personManagementViewPage = await startPage.goToAdministration();  
    schuleCreationPage = await personManagementViewPage.menu.navigateToSchuleCreation();
  });

  test(`Schulen Anlage: UI prüfen`, { tag: [DEV, STAGE] },  async () => {
    await schuleCreationPage.checkCreateForm();
  });

  test.describe('Einzelne Schule anlegen', () => {
    let schuleParams1: SchuleCreationParams;

    test.beforeEach(() => {
      // Testdaten vorbereiten
      schuleParams1 = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
    });

    // SPSH-2954
    test(`Eine Schule anlegen als Landesadmin und die Bestätigungsseite vollständig prüfen`, { tag: [DEV, STAGE] },  async () => {
      await test.step(`Schule anlegen`, async () => {
        schuleCreationSuccessPage = await schuleCreationPage.createSchule(schuleParams1);
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await schuleCreationSuccessPage.waitForPageLoad();
        await schuleCreationSuccessPage.checkSuccessfulCreation(schuleParams1);
      });
    });
  });

  test.describe('Mehrere Schulen anlegen', () => {
    let schuleParams1: SchuleCreationParams;
    let schuleParams2: SchuleCreationParams;

    test.beforeEach(() => {
      // Testdaten vorbereiten
      schuleParams1 = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };

      schuleParams2 = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Ersatz
      };
    });

    // SPSH-2952
    test(`2 Schulen nacheinander anlegen als Landesadmin`, { tag: [DEV, STAGE] },  async () => {
      await test.step(`Erste Schule anlegen`, async () => {
        schuleCreationSuccessPage = await schuleCreationPage.createSchule(schuleParams1);
        await schuleCreationSuccessPage.waitForPageLoad();
        await schuleCreationSuccessPage.checkSuccessfulCreation(schuleParams1);
      });

      await test.step(`Zweite Schule anlegen`, async () => {
        schuleCreationPage = await schuleCreationSuccessPage.goBackToCreateAnotherSchule();
        schuleCreationSuccessPage = await schuleCreationPage.createSchule(schuleParams2);
        await schuleCreationSuccessPage.waitForPageLoad();
        await schuleCreationSuccessPage.checkSuccessfulCreation(schuleParams2);
      });

      await test.step(`In der Ergebnisliste prüfen, dass beide Schulen vorhanden sind`, async () => {
        schuleManagementViewPage = await schuleCreationSuccessPage.goBackToList();
        // Suche nach erster Schule
        await schuleManagementViewPage.searchByText(schuleParams1.name);
        await schuleManagementViewPage.checkIfSchuleExists(schuleParams1.name);
        await schuleManagementViewPage.checkRowCount(1);

        // Suche nach zweiter Schule
        await schuleManagementViewPage.searchByText(schuleParams2.name);
        await schuleManagementViewPage.checkIfSchuleExists(schuleParams2.name);
        await schuleManagementViewPage.checkRowCount(1);
      });
    });
  });
});