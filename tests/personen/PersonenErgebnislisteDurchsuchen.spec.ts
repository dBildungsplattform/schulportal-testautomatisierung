import { PlaywrightTestArgs, test } from '@playwright/test';

import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr, generateKlassenname, generateSchulname } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { getRolleId } from '../../base/api/rolleApi';

let header: HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let admin: UserInfo;

interface AdminFixture {
  organisationsName: string;
  dienststellenNr?: string;
  rolleName: string;
  bezeichnung: string;
}

[
  { organisationsName: landSH, dienststellenNr: undefined, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  {
    organisationsName: testschuleName,
    dienststellenNr: testschuleDstNr,
    rolleName: schuladminOeffentlichRolle,
    bezeichnung: 'Schuladmin',
  },
].forEach(({ organisationsName, dienststellenNr, rolleName, bezeichnung }: AdminFixture) => {
  let schuleId2: string;
  let schuleParams: SchuleCreationParams;
  test.describe(`Testfälle für die Ergebnisliste von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    const hasMultipleSchulen: boolean = bezeichnung !== 'Schuladmin (1 Schule)';
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      loginPage = await freshLoginPage(page);
      const startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Benutzern
      personManagementViewPage = await startPage.goToAdministration();
      personManagementViewPage.waitForPageLoad();

      admin = await createPersonWithPersonenkontext(
        page,
        organisationsName,
        rolleName,
        undefined,
        undefined,
        generateDienststellenNr()
      );

      const schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schuleParams = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      const schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
      await schuleSuccessPage.waitForPageLoad();
      const schuleId1: string = await getOrganisationId(page, organisationsName);
      schuleId2 = await getOrganisationId(page, schuleParams.name);
      const rolleId: string = await getRolleId(page, rolleName);
      await addSecondOrganisationToPerson(page, admin.personId, schuleId1, schuleId2, rolleId);

      landingPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      personManagementViewPage = await startPage.goToAdministration();
    });



    // SPSH-3056
    test.describe('Klassenfilter-Tests', () => {
      let klassenNamen: string[] = [];

      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        // 40 Klassen für die Schule anlegen
        klassenNamen = [];
        for (let i: number = 0; i < 40; i++) {
          const klassenname: string = generateKlassenname();
          await createKlasse(page, schuleId2, klassenname);
          klassenNamen.push(klassenname);
        }
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anzeigen`, { tag: [STAGE, DEV] }, async () => {
        await personManagementViewPage.filterBySchule(schuleParams.name);
        await personManagementViewPage.checkAllDropdownOptionsVisible(klassenNamen);
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anklickbar`, { tag: [STAGE, DEV] }, async () => {
        await personManagementViewPage.filterBySchule(schuleParams.name);
        await personManagementViewPage.checkAllDropdownOptionsClickable(klassenNamen);
      });
    });
  });
});
