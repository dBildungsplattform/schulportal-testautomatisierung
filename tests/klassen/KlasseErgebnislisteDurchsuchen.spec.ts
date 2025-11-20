import { PlaywrightTestArgs, test } from '@playwright/test';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { landSH, testschuleName } from '../../base/organisation';
import { generateKlassenname } from '../../base/utils/generateTestdata';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { landesadminRolle } from '../../base/rollen';

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
test.describe(`Testfälle für die Ergebnisliste von Klassen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

    // Navigation zur Klassenanlage
    personManagementViewPage = await startPage.goToAdministration();
    klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
    await klasseAnlegenPage.waitForPageLoad();  

    // Testdaten vorbereiten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };
  });

  test('Klasse als Landesadmin anlegen und Ergebnisliste prüfen', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {

    await test.step(`Klasse anlegen`, async () => {
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasseAsLandesadmin(klasseParams);
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