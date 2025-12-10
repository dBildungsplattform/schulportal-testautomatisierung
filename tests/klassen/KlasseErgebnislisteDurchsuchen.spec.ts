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

let header: HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseErgebnislistePage : KlasseManagementViewPage;
let klasseParams : KlasseCreationParams;
let admin: UserInfo;


[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für die Ergebnisliste von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      loginPage = await freshLoginPage(page);
      await loginPage.login(process.env.USER, process.env.PW);

      admin = await createPersonWithPersonenkontext(page, organisationsName, rolleName);

      landingPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
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

    // SPSH-2853
    test(`Als ${bezeichnung}: Klasse Ergebnisliste: UI prüfen`, { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
      await klasseErgebnislistePage.checkManagementPage(rolleName == landesadminRolle);
    });

    // SPSH-2855
    test(`Als ${bezeichnung}: Jede Klasse hat eine Dienststellennummer neben dem Klassennamen (ersten und letzten 100 Einträge)`, { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
      // erste 100 Einträge 
      await klasseErgebnislistePage.setItemsPerPage('100');
      await klasseErgebnislistePage.checkTableData(rolleName == landesadminRolle);

      // letzte 100 Einträge (nur für Landesadmin)
      if (rolleName == landesadminRolle) {
        await klasseErgebnislistePage.goToLastPage();
        klasseErgebnislistePage = await klasseErgebnislistePage.waitForPageLoad();
        await klasseErgebnislistePage.checkTableData(rolleName == landesadminRolle);
      }
    });

    test(`Klasse als ${bezeichnung} anlegen und Ergebnisliste prüfen`, { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
      await test.step(`Klasse anlegen`, async () => {
        klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
        await klasseAnlegenPage.waitForPageLoad();
        klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(rolleName == landesadminRolle, klasseParams);
        await klasseErfolgreichAngelegtPage.waitForPageLoad();
        await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
      });

      await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
        klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
        await klasseErgebnislistePage.waitForPageLoad();
        if (rolleName == landesadminRolle) {
          await klasseErgebnislistePage.filterBySchule(klasseParams.schulname);
        } else {
          await klasseErgebnislistePage.checkIfSchuleIsCorrect(klasseParams);
        }
        await klasseErgebnislistePage.filterByKlasse(klasseParams.klassenname);
        await klasseErgebnislistePage.checkIfKlasseExists(klasseParams.klassenname);
      });
    });
  });
});