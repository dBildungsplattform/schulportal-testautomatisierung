import { PlaywrightTestArgs, test } from '@playwright/test';
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { KlasseDetailsViewPage } from '../../pages/admin/organisationen/klassen/details/KlasseDetailsView.neu.page';
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { generateKlassenname } from '../../base/utils/generateTestdata';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';

let header:  HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseErgebnislistePage : KlasseManagementViewPage;
let klasseDetailsPage : KlasseDetailsViewPage;
let klasseParams : KlasseCreationParams;
let klasseParamsBearbeitet : KlasseCreationParams;
let landesadmin: UserInfo;
let schuladmin: UserInfo;

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Landesadmin xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe(`Testfälle für das Bearbeiten von Klassen als Landesadmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

    // Testdaten vorbereiten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };

    klasseParamsBearbeitet = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };
  });

  // SPSH-2856
  test('Klasse bearbeiten als Landesadmin', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await test.step(`Klasse anlegen`, async () => {
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(true, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
    });

    await test.step(`Klasse öffnen`, async () => {
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
      await klasseErgebnislistePage.waitForPageLoad();
      klasseDetailsPage = await klasseErgebnislistePage.searchAndOpenGesamtuebersicht(true, klasseParams);
    });

    await test.step(`Klasse bearbeiten und Bestätigungsseite prüfen`, async () => {
      await klasseDetailsPage.checkDetailsForm();
      await klasseDetailsPage.editKlasse(klasseParamsBearbeitet.klassenname);
      await klasseDetailsPage.klasseSuccessfullyEdited(klasseParamsBearbeitet.schulname, testschuleDstNr, klasseParamsBearbeitet.klassenname);
    });

  });
});

/*
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx Schuladmin xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
*/
test.describe(`Testfälle für das Bearbeiten von Klassen als Schuladmin: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

    personManagementViewPage = await startPage.goToAdministration();
    klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();

    // Testdaten vorbereiten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname(),
      schulNr: testschuleDstNr
    };

    klasseParamsBearbeitet = {
      schulname: testschuleName,
      klassenname: await generateKlassenname(),
      schulNr: testschuleDstNr
    };
  });

  // SPSH-2857
  test('Klasse bearbeiten als Schuladmin', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {
    await test.step(`Klasse anlegen`, async () => {
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(false, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
    });

    await test.step(`Klasse öffnen`, async () => {
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
      await klasseErgebnislistePage.waitForPageLoad();
      klasseDetailsPage = await klasseErgebnislistePage.searchAndOpenGesamtuebersicht(false, klasseParams);
    });

    await test.step(`Klasse bearbeiten und Bestätigungsseite prüfen`, async () => {
      await klasseDetailsPage.checkDetailsForm();
      await klasseDetailsPage.editKlasse(klasseParamsBearbeitet.klassenname);
      await klasseDetailsPage.klasseSuccessfullyEdited(klasseParamsBearbeitet.schulname, testschuleDstNr, klasseParamsBearbeitet.klassenname);
    });

  });

});