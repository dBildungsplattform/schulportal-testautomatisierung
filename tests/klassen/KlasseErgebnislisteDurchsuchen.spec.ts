import { PlaywrightTestArgs, test } from '@playwright/test';
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { generateKlassenname } from '../../base/utils/generateTestdata';
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';

let header:  HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseErgebnislistePage : KlasseManagementViewPage;
let klasseParams : KlasseCreationParams;
let landesadmin: UserInfo;
let schuladmin: UserInfo;

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Landesadmin xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe(`Testfälle für die Ergebnisliste von Klassen als Landesadmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

    // Navigation zur Ergebnisliste von Klassen
    personManagementViewPage = await startPage.goToAdministration();  
    klasseErgebnislistePage = await personManagementViewPage.menu.navigateToKlasseManagement();

    // Testdaten vorbereiten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };
  });

  // SPSH-2853
  test('Als Landesadmin: Klasse Ergebnisliste: UI prüfen', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await klasseErgebnislistePage.checkUI(true);
  });

  // SPSH-2855
  test('Als Landesadmin: Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    // erste 100 Einträge 
    await klasseErgebnislistePage.setItemsPerPage('100');
    await klasseErgebnislistePage.checkTableData(true);

    // letzte 100 Einträge
    await klasseErgebnislistePage.goToLastPage();
    await klasseErgebnislistePage.checkTableData(true);

  });

  test('Klasse als Landesadmin anlegen und Ergebnisliste prüfen', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await test.step(`Klasse anlegen`, async () => {
      klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
      await klasseAnlegenPage.waitForPageLoad();
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(true, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
      await klasseErgebnislistePage.waitForPageLoad();
      await klasseErgebnislistePage.filterBySchule(klasseParams.schulname);
      await klasseErgebnislistePage.filterByKlasse(klasseParams.klassenname);
      await klasseErgebnislistePage.checkIfKlasseExists(klasseParams.klassenname);
    });
  });
});

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe(`Testfälle für die Ergebnisliste von Klassen als Schuladmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    header = new HeaderPage(page);
    loginPage = await freshLoginPage(page);
    await loginPage.login(process.env.USER, process.env.PW);

    schuladmin = await createPersonWithPersonenkontext(page, testschuleName, schuladminOeffentlichRolle);

    landingPage = await header.logout();
    landingPage.navigateToLogin();

    // Erstmalige Anmeldung mit Passwortänderung
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(schuladmin.username, schuladmin.password)
    await startPage.waitForPageLoad();

    // Navigation zur Ergebnisliste von Klassen
    personManagementViewPage = await startPage.goToAdministration();  
    klasseErgebnislistePage = await personManagementViewPage.menu.navigateToKlasseManagement();

    // Testdaten vorbereiten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname(),
      schulNr: testschuleDstNr
    };
  });

  test('Als Schuladmin: Klasse Ergebnisliste: UI prüfen', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await klasseErgebnislistePage.checkUI(false);
  });

  // SPSH-2855
  test('Als Schuladmin: Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    // erste 100 Einträge 
    await klasseErgebnislistePage.setItemsPerPage('100');
    await klasseErgebnislistePage.checkTableData(false);

    // letzte 100 Einträge
    await klasseErgebnislistePage.goToLastPage();
    await klasseErgebnislistePage.checkTableData(false);

  });

  test('Klasse als Schuladmin anlegen und Ergebnisliste prüfen', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await test.step(`Klasse anlegen`, async () => {
      klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
      await klasseAnlegenPage.waitForPageLoad();
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(false, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
      await klasseErgebnislistePage.waitForPageLoad();
      await klasseErgebnislistePage.checkIfSchuleIsCorrect(klasseParams);
      await klasseErgebnislistePage.filterByKlasse(klasseParams.klassenname);
      await klasseErgebnislistePage.checkIfKlasseExists(klasseParams.klassenname);
    });
  });
});