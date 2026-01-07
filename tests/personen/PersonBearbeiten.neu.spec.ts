import { PlaywrightTestArgs, test } from '@playwright/test';
import { createPersonWithPersonenkontext, createRolleAndPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { createKlasse, getKlasseId, getOrganisationId } from '../../base/api/organisationApi';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr, generateSchulname, generateKlassenname, generateVorname, generateNachname, generateRolleName } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from "../../pages/admin/personen/PersonManagementView.neu.page";
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { landSH } from '../../base/organisation';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { typeSchueler } from '../../base/rollentypen';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { itslearning } from '../../base/sp';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { ZuordnungValidationParams, ZuordnungenPage } from '../../pages/admin/personen/details/Zuordnungen.page';

[
  { rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin' },
].forEach(({ rolleName, bezeichnung }: { rolleName: string; bezeichnung: string }) => {
  test.describe(`Testfälle für die Ergebnisliste von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    let header: HeaderPage;
    let loginPage: LoginViewPage;
    let personManagementViewPage: PersonManagementViewPage;
    let schuleParams: SchuleCreationParams;
    let schuleId: string;
    let admin: UserInfo;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      header = new HeaderPage(page);
      loginPage = await freshLoginPage(page);
      let startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
      await startPage.waitForPageLoad();

      // Schule anlegen
      personManagementViewPage = await startPage.goToAdministration();  
      const schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schuleParams = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      const schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
      await schuleSuccessPage.waitForPageLoad();
      schuleId = await getOrganisationId(page, schuleParams.name);

      // Admin anlegen
      admin = await createPersonWithPersonenkontext(page, rolleName === landesadminRolle ? landSH : schuleParams.name, rolleName, undefined, undefined, generateDienststellenNr());

      const landingPage: LandingViewPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      startPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password)
      await startPage.waitForPageLoad();

      // Navigation zur Ergebnisliste von Benutzern
      personManagementViewPage = await startPage.goToAdministration();  
    });

    test.describe('Klassenfilter-Tests', () => {
      let klassenNamen: string[] = [];
      let schueler: UserInfo;
      let personDetailsViewPage: PersonDetailsViewPage
      let zuordnungenPage: ZuordnungenPage;
      let params: ZuordnungValidationParams;

      //zweites before-each damit andere Tests spater nicht beeinflusst werden
      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        // 40 Klassen für die Schule anlegen
        klassenNamen = [];
        for (let i: number = 0; i < 40; i++) {
          const klassenname: string = generateKlassenname();
          await createKlasse(page, schuleId, klassenname);
          klassenNamen.push(klassenname);
        }

        // Schüler anlegen
        const schuelerKopers: string = generateDienststellenNr();
        schueler = await createRolleAndPersonWithPersonenkontext(
          page, 
          schuleParams.name, 
          typeSchueler,
          generateNachname(), 
          generateVorname(), 
          [await getServiceProviderId(page, itslearning)],
          generateRolleName(),
          schuelerKopers,
          await getKlasseId(page, klassenNamen[0])
        );
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down bei SuS versetzen anzeigen`, { tag: [STAGE, DEV] }, async () => {
        await test.step(`Bearbeiten-Ansicht eines Schülers öffnen`, async () => {
          // Für Landesadmin: erst nach Schule filtern
          if (rolleName === landesadminRolle) {
            await personManagementViewPage.filterBySchule(schuleParams.name);
          }
          personDetailsViewPage = await personManagementViewPage.searchAndOpenGesamtuebersicht(schueler.kopersnummer);
          await personDetailsViewPage.waitForPageLoad();

        });

        await test.step(`Zum Klassen-Drop-Down navigieren`, async () => {
          zuordnungenPage = await personDetailsViewPage.editZuordnungen();
          params = {
            organisation: schuleParams.name,
            dstNr: schuleParams.dienststellenNr
          };
          await zuordnungenPage.selectZuordnungToEdit(params);
          await zuordnungenPage.clickVersetzen();
        });

        await test.step(`Klassen-Drop-Down überprüfen`, async () => {
          await zuordnungenPage.checkKlasseDropdownVisibleAndClickable(klassenNamen)
        });
      });

      test(`Als ${bezeichnung}: Alle Klassen im Drop-Down bei Schulzuordnung hinzufügen anzeigen`, { tag: [STAGE, DEV] }, async () => {
        //Todo
      });
    });
  });
});