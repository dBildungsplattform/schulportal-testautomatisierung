import { PlaywrightTestArgs, test } from '@playwright/test';
import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { landSH } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr, generateSchulname } from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { getOrganisationId } from '../../base/api/organisationApi';
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import { SchuleCreationParams, SchuleCreationViewPage, Schulform } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';
import { getRolleId } from '../../base/api/rolleApi';
import { createKlassenAndSchuelerForSchulen, KlassenAndSchuelerData } from '../helpers/createKlassenAndSchuelerForSchulen';

interface AdminFixture {
  organisationsName?: string;
  rolleName: string;
  bezeichnung: string;
}

[
  { organisationsName: landSH, rolleName: landesadminRolle, bezeichnung: 'Landesadmin' },
  { rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (1 Schule)' },
  { rolleName: schuladminOeffentlichRolle, bezeichnung: 'Schuladmin (2 Schulen)' },
].forEach(({ organisationsName, rolleName, bezeichnung }: AdminFixture) => {
  test.describe(`Testfälle für die Mehrfachbearbeitung von Benutzern als ${bezeichnung}: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    const hasMultipleSchulen: boolean = bezeichnung !== 'Schuladmin (1 Schule)';
    let personManagementViewPage: PersonManagementViewPage;
    let schule1Params: SchuleCreationParams;
    let schule2Params: SchuleCreationParams;
    let schuleId: string;
    let schuleId2: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const loginPage: LoginViewPage = await freshLoginPage(page);
      let startPage: StartViewPage = await loginPage.login(process.env.USER, process.env.PW);
      await startPage.waitForPageLoad();

      // Schule anlegen
      personManagementViewPage = await startPage.goToAdministration();
      let schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
      schule1Params = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich
      };
      let schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schule1Params);
      await schuleSuccessPage.waitForPageLoad();
      schuleId = await getOrganisationId(page, schule1Params.name);

      const adminOrganisation: string = organisationsName || schule1Params.name;
      const admin: UserInfo = await createPersonWithPersonenkontext(page, adminOrganisation, rolleName);

      // für Admins mit mehreren Schulen: zweite Schule anlegen
      if (hasMultipleSchulen) {
        schule2Params = {
          name: generateSchulname(),
          dienststellenNr: generateDienststellenNr(),
          schulform: Schulform.Oeffentlich
        };
        schuleCreationViewPage = await schuleSuccessPage.goBackToCreateAnotherSchule();
        schuleSuccessPage = await schuleCreationViewPage.createSchule(schule2Params);
        await schuleSuccessPage.waitForPageLoad();
        schuleId2 = await getOrganisationId(page, schule2Params.name);

        const rolleId: string = await getRolleId(page, rolleName);
        await addSecondOrganisationToPerson(page, admin.personId, schuleId, schuleId2, rolleId);
      }

      const landingPage: LandingViewPage = await header.logout();
      landingPage.navigateToLogin();

      // Anmeldung mit Passwortänderung
      startPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      personManagementViewPage = await startPage.goToAdministration();
    });

    test(`Als ${bezeichnung}: Schüler versetzen als Mehrfachbearbeitung prüfen`, { tag: [STAGE, DEV] }, async ({ page }: PlaywrightTestArgs) => {
      let testData: KlassenAndSchuelerData[];

      await test.step(`Testdaten erstellen`, async () => {
        testData = await createKlassenAndSchuelerForSchulen(page, [
          { params: schule1Params, schuleId, klassenCount: 26, schuelerCount: 3 },
          ...(hasMultipleSchulen ? [{ params: schule2Params, schuleId: schuleId2, klassenCount: 2, schuelerCount: 2 }] : [])
        ]);
      });

      if (hasMultipleSchulen) {
        await test.step(`Fehlermeldungen für Schule und Schülerrolle testen`, async () => {
          await personManagementViewPage.setItemsPerPage(50);
          await personManagementViewPage.toggleSelectAllRows(true);
          await personManagementViewPage.selectMehrfachauswahl('Schüler versetzen');
          await personManagementViewPage.checkSchuelerVersetzenErrorDialog('all');
          await personManagementViewPage.closeDialog('invalid-selection-alert-dialog-cancel-button');

          await personManagementViewPage.filterBySchule(schule1Params.name);
        });
      }

      await test.step(`Fehlermeldungen nur für Schülerrolle testen`, async () => {
        await personManagementViewPage.setItemsPerPage(5);
        await personManagementViewPage.toggleSelectAllRows(true);
        await personManagementViewPage.selectMehrfachauswahl('Schüler versetzen');
        await personManagementViewPage.checkSchuelerVersetzenErrorDialog('rolle');
        await personManagementViewPage.closeDialog('invalid-selection-alert-dialog-cancel-button');
      });
    
      await test.step(`Nur Schüler auswählen`, async () => {
        await personManagementViewPage.toggleSelectAllRows(false);
        for (const schueler of testData[0].schuelerSchule) {
          await personManagementViewPage.checkIfPersonExists(`${schueler.nachname}`);
          await personManagementViewPage.selectPerson(`${schueler.nachname}`);
          await personManagementViewPage.checkPersonSelected(`${schueler.nachname}`);
        }
      });

      await test.step(`Schüler versetzen-Dialog prüfen und anschließend versetzen`, async () => {
        await personManagementViewPage.selectMehrfachauswahl('Schüler versetzen');
        await personManagementViewPage.checkSchuelerVersetzenDialog(testData[0].klassenNamenSchule);
        await personManagementViewPage.versetzeSchueler(testData[0].klassenNamenSchule[0]);
      });

      await test.step(`Progressbar und Erfolgsdialog prüfen`, async () => {
        await personManagementViewPage.checkSchuelerVersetzenInProgress();
        await personManagementViewPage.checkSchuelerVersetzenSuccessDialog();
        await personManagementViewPage.closeDialog('bulk-change-klasse-close-button');
      });

      await test.step(`Aktualisierte Ergebnisliste prüfen`, async () => {
        await personManagementViewPage.checkNewKlasseNachVersetzen(testData[0].schuelerSchule, testData[0].klassenNamenSchule[0]);
      });
    });
  });
});

