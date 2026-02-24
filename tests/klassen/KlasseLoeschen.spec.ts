import { PlaywrightTestArgs, test } from '@playwright/test';

import { getKlasseId } from '../../base/api/organisationApi';
import { createPersonWithPersonenkontext, createRolleAndPersonWithPersonenkontext, UserInfo } from "../../base/api/personApi";
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateKlassenname, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { KlasseCreationParams, KlasseCreationViewPage } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { KlasseDetailsViewPage } from '../../pages/admin/organisationen/klassen/details/KlasseDetailsView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { HeaderPage } from '../../pages/components/Header.neu.page';

let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseErgebnislistePage : KlasseManagementViewPage;
let klasseDetailsPage : KlasseDetailsViewPage;
let klasseParams : KlasseCreationParams;
let admin : UserInfo;

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für das Löschen von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {

      await loginAndNavigateToAdministration(page);

      admin = await createPersonWithPersonenkontext(page, organisationsName, rolleName);

      const landingPage: LandingViewPage = await (new HeaderPage(page)).logout();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Klasse anlegen
      const personManagementViewPage: PersonManagementViewPage = await startPage.navigateToAdministration();
      klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
      klasseParams = {
        schulname: testschuleName,
        klassenname: generateKlassenname(),
        schulNr: testschuleDstNr
      };
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(rolleName == landesadminRolle, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
    });

    // SPSH-2858 & SPSH-2859
    test(`Eine Klasse ohne zugeordnete Personen als ${bezeichnung} via Quickaction löschen`, { tag: [STAGE, DEV] }, async () => {
      await klasseErgebnislistePage.searchAndDeleteKlasse(rolleName == landesadminRolle, klasseParams);
      await klasseErgebnislistePage.klasseSuccessfullyDeleted(klasseParams.schulname, klasseParams.klassenname, klasseParams.schulNr);
    });

    // SPSH-2861 & SPSH-2862 
    test(`Eine Klasse ohne zugeordnete Personen als ${bezeichnung} via Gesamtübersicht löschen`, { tag: [STAGE, DEV] }, async () => {
      klasseDetailsPage = await klasseErgebnislistePage.searchAndOpenGesamtuebersicht(rolleName == landesadminRolle, klasseParams);
      klasseErgebnislistePage = await klasseDetailsPage.successfullyDeleteKlasse(klasseParams.schulname, klasseParams.klassenname);
    });

    // SPSH-2860 
    test(`Eine Klasse mit einem zugeordneten Schüler als ${bezeichnung} via Quickaction löschen`, { tag: [STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = generateVorname();
        const schuelerNachname: string = generateNachname();
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const schuelerRolleName: string = generateRolleName();
        const klasseId: string = await getKlasseId(page, klasseParams.klassenname);

        await createRolleAndPersonWithPersonenkontext(
          page, 
          klasseParams.schulname, 
          typeSchueler,
          schuelerNachname, 
          schuelerVorname, 
          schuelerIdSPs,
          schuelerRolleName,
          undefined,
          klasseId
        );
      });

      await test.step(`Prüfen, dass die Klasse nicht gelöscht werden kann`, async () => {
        await klasseErgebnislistePage.searchAndDeleteKlasse(rolleName == landesadminRolle, klasseParams);
        await klasseErgebnislistePage.klasseDeletionFailed();
      });
    });

    // SPSH-2863 
    test(`Eine Klasse mit einem zugeordneten Schüler als ${bezeichnung} via Gesamtübersicht löschen `, { tag: [STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = generateVorname();
        const schuelerNachname: string = generateNachname();
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const schuelerRolleName: string = generateRolleName();
        const klasseId: string = await getKlasseId(page, klasseParams.klassenname);

        await createRolleAndPersonWithPersonenkontext(
          page, 
          klasseParams.schulname, 
          typeSchueler,
          schuelerNachname, 
          schuelerVorname, 
          schuelerIdSPs,
          schuelerRolleName,
          undefined,
          klasseId
        );
      });

      await test.step(`Prüfen, dass die Klasse nicht gelöscht werden kann`, async () => {
        klasseDetailsPage = await klasseErgebnislistePage.searchAndOpenGesamtuebersicht(rolleName == landesadminRolle, klasseParams);
        await klasseDetailsPage.unsuccessfullyDeleteKlasse(klasseParams.schulname, klasseParams.klassenname);
      });
    });
  });
});

