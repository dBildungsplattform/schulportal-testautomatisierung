import { PlaywrightTestArgs, test } from '@playwright/test';
import { BROWSER, LONG, SHORT, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { KlasseCreationViewPage, KlasseCreationParams } from '../../pages/admin/organisationen/klassen/KlasseCreationView.neu.page';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { generateKlassenname, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { KlasseCreationSuccessPage } from '../../pages/admin/organisationen/klassen/KlasseCreationSuccess.page';
import { createPersonWithPersonenkontext, createRolleAndPersonWithPersonenkontext, freshLoginPage, UserInfo } from "../../base/api/personApi";
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { KlasseManagementViewPage } from '../../pages/admin/organisationen/klassen/KlasseManagementView.neu.page';
import { KlasseDetailsViewPage } from '../../pages/admin/organisationen/klassen/details/KlasseDetailsView.neu.page';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { getKlasseId } from '../../base/api/organisationApi';

let header: HeaderPage;
let landingPage: LandingViewPage;
let loginPage: LoginViewPage;
let personManagementViewPage: PersonManagementViewPage;
let klasseAnlegenPage : KlasseCreationViewPage;
let klasseErfolgreichAngelegtPage : KlasseCreationSuccessPage;
let klasseErgebnislistePage : KlasseManagementViewPage;
let klasseDetailsPage : KlasseDetailsViewPage;
let klasseParams : KlasseCreationParams;
let admin : UserInfo;
let schueler : UserInfo;


[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { organisationsName: testschuleName, rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ organisationsName, rolleName, bezeichnung }: { organisationsName: string; rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für das Löschen von Klassen als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

      // Klasse anlegen
      personManagementViewPage = await startPage.goToAdministration();
      klasseAnlegenPage = await personManagementViewPage.menu.navigateToKlasseCreation();
      klasseParams = {
        schulname: testschuleName,
        klassenname: await generateKlassenname(),
        schulNr: testschuleDstNr
      };
      klasseErfolgreichAngelegtPage = await klasseAnlegenPage.createKlasse(rolleName == landesadminRolle, klasseParams);
      await klasseErfolgreichAngelegtPage.waitForPageLoad();
      klasseErgebnislistePage = await klasseErfolgreichAngelegtPage.goBackToList();
    });

    // SPSH-2858 & SPSH-2859
    test(`Eine Klasse ohne zugeordnete Personen als ${bezeichnung} via Quickaction löschen`, { tag: [LONG, SHORT, STAGE, BROWSER] }, async () => {
      await klasseErgebnislistePage.searchAndDeleteKlasse(rolleName == landesadminRolle, klasseParams);
      await klasseErgebnislistePage.klasseSuccessfullyDeleted(klasseParams.schulname, klasseParams.klassenname, klasseParams.schulNr);
    });

    // SPSH-2861 & SPSH-2862 
    test(`Eine Klasse ohne zugeordnete Personen als ${bezeichnung} via Gesamtübersicht löschen`, { tag: [LONG, SHORT, STAGE, BROWSER] }, async () => {
      klasseDetailsPage = await klasseErgebnislistePage.searchAndOpenGesamtuebersicht(rolleName == landesadminRolle, klasseParams);
      klasseErgebnislistePage = await klasseDetailsPage.successfullyDeleteKlasse(klasseParams.schulname, klasseParams.klassenname);
    });

    // SPSH-2860 
    test(`Eine Klasse mit einem zugeordneten Schüler als ${bezeichnung} via Quickaction löschen`, { tag: [LONG, SHORT, STAGE, BROWSER] }, async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = await generateVorname();
        const schuelerNachname: string = await generateNachname();
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const schuelerRolleName: string = await generateRolleName();
        const klasseId: string = await getKlasseId(page, klasseParams.klassenname);

        schueler = await createRolleAndPersonWithPersonenkontext(
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
    test(`Eine Klasse mit einem zugeordneten Schüler als ${bezeichnung} via Gesamtübersicht löschen `, { tag: [LONG, SHORT, STAGE, BROWSER] }, async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Schüler anlegen`, async () => {
        const schuelerVorname: string = await generateVorname();
        const schuelerNachname: string = await generateNachname();
        const schuelerIdSPs: string[] = [await getServiceProviderId(page, itslearning)];
        const schuelerRolleName: string = await generateRolleName();
        const klasseId: string = await getKlasseId(page, klasseParams.klassenname);

        schueler = await createRolleAndPersonWithPersonenkontext(
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

