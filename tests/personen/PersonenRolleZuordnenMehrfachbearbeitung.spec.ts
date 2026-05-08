import { PlaywrightTestArgs, test } from '@playwright/test';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import {
  createPersonWithPersonenkontext,
  createRolleAndPersonWithPersonenkontext,
  UserInfo,
} from '../../base/api/personApi';
import { addServiceProvidersToRolle, createRolle } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { testschuleName } from '../../base/organisation';
import { schuladminOeffentlichRolle } from '../../base/rollen';
import { typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { DEV } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.page';
import { LoginViewPage } from '../../pages/LoginView.page';
import { StartViewPage } from '../../pages/StartView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';

test.describe(`Mehrfachbearbeitung Rolle zuordnen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.describe(`Als Schuladmin (1 Schule)`, () => {
    let personManagementViewPage: PersonManagementViewPage;
    let schueler1: UserInfo;
    let schueler2: UserInfo;
    let zielRolleName: string;
    let klasse1Name: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Als Landesadmin anmelden`, async () => {
        personManagementViewPage = await loginAndNavigateToAdministration(page);
      });

      await test.step(`Testdaten via API anlegen (Schule mit 2 Klassen, 2 Schüler an einer Klasse, Ziel-Lern-Rolle, Schuladmin)`, async () => {
        const schuleId: string = await getOrganisationId(page, testschuleName);
        const itslearningId: string = await getServiceProviderId(page, itslearning);

        // Zwei Klassen anlegen
        klasse1Name = generateKlassenname();
        const klasse2Name: string = generateKlassenname();
        const klasse1Id: string = await createKlasse(page, schuleId, klasse1Name);
        await createKlasse(page, schuleId, klasse2Name);

        // Ziel-Lern-Rolle anlegen, mit der die Mehrfachbearbeitung durchgeführt wird
        zielRolleName = generateRolleName();
        const zielRolleId: string = await createRolle(page, typeSchueler, schuleId, zielRolleName);
        await addServiceProvidersToRolle(page, zielRolleId, [itslearningId]);

        // Zwei Schüler mit jeweils eigener Lern-Rolle in Klasse 1 anlegen
        schueler1 = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [itslearningId],
          generateRolleName(),
          undefined,
          klasse1Id,
        );

        schueler2 = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [itslearningId],
          generateRolleName(),
          undefined,
          klasse1Id,
        );

        // Schuladmin (1 Schule) anlegen
        const admin: UserInfo = await createPersonWithPersonenkontext(
          page,
          testschuleName,
          schuladminOeffentlichRolle,
        );

        // Als Schuladmin neu anmelden (inkl. Passwortwechsel)
        const landingPage: LandingViewPage = await personManagementViewPage.getHeader().logout();
        const loginPage: LoginViewPage = await landingPage.navigateToLogin();
        const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
          admin.username,
          admin.password,
        );
        await startPage.waitForPageLoad();
        personManagementViewPage = await startPage.navigateToAdministration();
      });
    });

    test(
      `Lern-Rolle mehreren Schülern an einer Klasse über "Klasse(n) beibehalten" zuordnen`,
      { tag: [DEV] },
      async () => {
        await test.step(`Nach Klasse filtern und beide Schüler auswählen`, async () => {
          await personManagementViewPage.waitForPageLoad();
          await personManagementViewPage.filterByKlasse(klasse1Name);
          await personManagementViewPage.waitForDataLoad();
          await personManagementViewPage.selectPerson(schueler1.nachname);
          await personManagementViewPage.checkPersonSelected(schueler1.nachname);
          await personManagementViewPage.selectPerson(schueler2.nachname);
          await personManagementViewPage.checkPersonSelected(schueler2.nachname);
        });

        await test.step(`Mehrfachbearbeitung "Rolle zuordnen" öffnen und Lern-Rolle auswählen`, async () => {
          await personManagementViewPage.selectMehrfachauswahl('Rolle zuordnen');
          await personManagementViewPage.selectRolleInRolleZuordnenDialog(zielRolleName);
        });

        await test.step(`Beide Klassen-Optionen prüfen, "Klasse(n) beibehalten" ist standardmäßig ausgewählt`, async () => {
          await personManagementViewPage.checkRolleZuordnenKlassenOptionen();
        });

        await test.step(`Hinweistext zur Beibehaltung der Klasse prüfen`, async () => {
          await personManagementViewPage.checkRolleZuordnenHint(
            'Bitte beachten: Die neue Rolle wird den ausgewählten Schülerinnen und Schülern an ihren bestehenden Klassen zusätzlich zugeordnet.',
          );
        });

        await test.step(`"Rolle zuordnen" abschicken und Erfolgsdialog prüfen`, async () => {
          await personManagementViewPage.submitRolleZuordnen();
          await personManagementViewPage.checkRolleZuordnenSuccessDialog();
          await personManagementViewPage.closeDialog('rolle-modify-close-button');
        });

        await test.step(`Aktualisierte Ergebnisliste prüfen: neue Rolle bei beiden Schülern sichtbar`, async () => {
          await personManagementViewPage.waitForDataLoad();
          await personManagementViewPage.checkRolleAssignedToPersons(zielRolleName, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
        });
      },
    );
  });
});

