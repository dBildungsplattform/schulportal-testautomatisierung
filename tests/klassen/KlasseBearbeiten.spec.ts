import { PlaywrightTestArgs, test } from '@playwright/test';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { freshLoginPage } from '../../base/api/personApi';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { testschuleDstNr, testschuleName } from '../../base/organisation';
import { generateKlassenname } from '../../base/utils/generateTestdata';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { KlasseDetailsViewPage } from '../../pages/admin/organisationen/klassen/details/KlasseDetailsView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

test.describe(`Testfälle für das Bearbeiten von Klassen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let loginPage: LoginViewPage;
  let personManagementViewPage: PersonManagementViewPage;
  let klasseAnlegenPage : KlasseCreationViewPage;
  let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
  let klasseErgebnislistePage : KlasseManagementViewPage;
  let klasseGesamtuebersichtPage : KlasseDetailsViewPage;
  let klasseParams : KlasseCreationParams;
  let klasseParamsBearbeitet : KlasseCreationParams;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);

    personManagementViewPage = await startPage.goToAdministration();
    klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
    await klasseAnlegenPage.waitForPageLoad(); 

    // Testdaten
    klasseParams = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };

    klasseParamsBearbeitet = {
      schulname: testschuleName,
      klassenname: await generateKlassenname()
    };
  });

  test('Klasse bearbeiten als Landesadmin', { tag: [LONG, SHORT, STAGE, BROWSER] },  async () => {

    await test.step(`Klasse anlegen`, async () => {
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(klasseParams);
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

    await test.step(`Klasse öffnen, bearbeiten und Erfolgsseite prüfen`, async () => {
      klasseGesamtuebersichtPage = await klasseErgebnislistePage.openGesamtuebersicht(klasseParams.klassenname);
      await klasseGesamtuebersichtPage.editKlasse(klasseParamsBearbeitet.klassenname);
      await klasseGesamtuebersichtPage.klasseSuccessfullyEdited(klasseParamsBearbeitet.schulname, testschuleDstNr, klasseParamsBearbeitet.klassenname);
    });

  });

});