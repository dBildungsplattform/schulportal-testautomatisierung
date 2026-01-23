import { PlaywrightTestArgs, test } from '@playwright/test';

import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateKlassenname } from '../../base/utils/generateTestdata';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseCreationParams, KlasseCreationViewPage } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';

let personManagementViewPage: PersonManagementViewPage;
let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseParams : KlasseCreationParams;

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für das Anlegen von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {

      await loginAndNavigateToAdministration(page);

      const admin: UserInfo = await createPersonWithPersonenkontext(page, organisationsName, rolleName);

      const landingPage: LandingViewPage = await new HeaderPage(page).logout();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Navigation zur Klassenanlage
      personManagementViewPage = await startPage.navigateToAdministration();
      klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();

      // Testdaten vorbereiten
      klasseParams = {
        schulname: testschuleName,
        klassenname: generateKlassenname(),
        schulNr: testschuleDstNr
      };
    });

    test(`Klasse als ${bezeichnung} anlegen: UI prüfen`, { tag: [STAGE, DEV] }, async () => {
      await klasseAnlegenPage.checkCreateForm();
    });

    // SPSH-2854
    test(`Klasse als ${bezeichnung} anlegen und Bestätigungsseite prüfen`, { tag: [STAGE, DEV] },  async () => {
      await test.step(`Klasse anlegen`, async () => {
        klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(rolleName == landesadminRolle, klasseParams);
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await klasseErfolgreichAngelegtPage.waitForPageLoad();
        await klasseErfolgreichAngelegtPage.checkSuccessPage(klasseParams);
      });
    });
  });
});