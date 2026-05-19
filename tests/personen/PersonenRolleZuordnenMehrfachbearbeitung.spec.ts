import { PlaywrightTestArgs, test } from '@playwright/test';
import { createKlasse, createSchule } from '../../base/api/organisationApi';
import {
  addSecondOrganisationToPerson,
  createPerson,
  createPersonWithPersonenkontext,
  createRolleAndPersonWithPersonenkontext,
  UserInfo,
} from '../../base/api/personApi';
import { addServiceProvidersToRolle, createRolle, getRolleId } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { schuladminOeffentlichRolle } from '../../base/rollen';
import { typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { DEV } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  formatDateDMY,
  generateCurrentDate,
  generateDienststellenNr,
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateSchulname,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.page';
import { LoginViewPage } from '../../pages/LoginView.page';
import { StartViewPage } from '../../pages/StartView.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.page';
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
        // Schule anlegen
        const schuleName: string = generateSchulname();
        const schuleDstNr: string = generateDienststellenNr();
        const schuleId: string = await createSchule(page, schuleName, schuleDstNr);
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
          schuleName,
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
          schuleName,
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
          schuleName,
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
          await personManagementViewPage.filterAndSelectPersons(undefined, klasse1Name, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
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
          await personManagementViewPage.checkKlasseAssignedToPersons(klasse1Name, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
        });
      },
    );
  });

  test.describe(`Als Schuladmin (2 Schulen)`, () => {
    let personManagementViewPage: PersonManagementViewPage;
    let schueler1: UserInfo;
    let schueler2: UserInfo;
    let schuelerMitZielRolle1: UserInfo;
    let schuelerMitZielRolle2: UserInfo;
    let zielRolleName: string;
    let zielKlasseName: string;
    let quellKlasseName: string;
    let schuleName: string;
    let schuleDstNr: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Als Landesadmin anmelden`, async () => {
        personManagementViewPage = await loginAndNavigateToAdministration(page);
      });

      await test.step(`Testdaten via API anlegen (Schule mit 2 Klassen, 2 Schüler an Quellklasse, Ziel-Lern-Rolle, Schuladmin mit 2 Schulen)`, async () => {
        // Zwei Schulen anlegen
        schuleName = generateSchulname();
        schuleDstNr = generateDienststellenNr();
        const schuleId: string = await createSchule(page, schuleName, schuleDstNr);

        const zweiteSchuleName: string = generateSchulname();
        const zweiteSchuleDstNr: string = generateDienststellenNr();
        const zweiteSchuleId: string = await createSchule(page, zweiteSchuleName, zweiteSchuleDstNr);

        const itslearningId: string = await getServiceProviderId(page, itslearning);

        // Quell- und Zielklasse an der ersten Schule anlegen
        quellKlasseName = generateKlassenname();
        zielKlasseName = generateKlassenname();
        const quellKlasseId: string = await createKlasse(page, schuleId, quellKlasseName);
        await createKlasse(page, schuleId, zielKlasseName);

        // Ziel-Lern-Rolle anlegen, mit der die Mehrfachbearbeitung durchgeführt wird
        zielRolleName = generateRolleName();
        const zielRolleId: string = await createRolle(page, typeSchueler, schuleId, zielRolleName);
        await addServiceProvidersToRolle(page, zielRolleId, [itslearningId]);

        // Zwei Schüler mit jeweils eigener Lern-Rolle in der Quellklasse anlegen
        schueler1 = await createRolleAndPersonWithPersonenkontext(
          page,
          schuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [itslearningId],
          generateRolleName(),
          undefined,
          quellKlasseId,
        );

        schueler2 = await createRolleAndPersonWithPersonenkontext(
          page,
          schuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [itslearningId],
          generateRolleName(),
          undefined,
          quellKlasseId,
        );

        // Zwei weitere Schüler in der Quellklasse, die bereits die Ziel-Lern-Rolle besitzen
        // (für Fehlerfall: erneute Zuordnung derselben Rolle an eine andere Klasse)
        schuelerMitZielRolle1 = await createPerson(
          page,
          schuleId,
          zielRolleId,
          generateNachname(),
          generateVorname(),
          undefined,
          quellKlasseId,
        );
        schuelerMitZielRolle2 = await createPerson(
          page,
          schuleId,
          zielRolleId,
          generateNachname(),
          generateVorname(),
          undefined,
          quellKlasseId,
        );

        // Schuladmin mit 2 Schulen anlegen
        const admin: UserInfo = await createPersonWithPersonenkontext(
          page,
          schuleName,
          schuladminOeffentlichRolle,
        );
        const schuladminRolleId: string = await getRolleId(page, schuladminOeffentlichRolle);
        await addSecondOrganisationToPerson(page, admin.personId, schuleId, zweiteSchuleId, schuladminRolleId);

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
      `Lern-Rolle mehreren Schülern an einer anderen Klasse über "Andere Klasse auswählen" zuordnen`,
      { tag: [DEV] },
      async () => {
        await test.step(`Nach Schule und Quellklasse filtern und beide Schüler auswählen`, async () => {
          await personManagementViewPage.filterAndSelectPersons(schuleName, quellKlasseName, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
        });

        await test.step(`Mehrfachbearbeitung "Rolle zuordnen" öffnen, Schule und Lern-Rolle auswählen`, async () => {
          await personManagementViewPage.selectMehrfachauswahl('Rolle zuordnen');
          await personManagementViewPage.selectSchuleInRolleZuordnenDialog(schuleName);
          await personManagementViewPage.selectRolleInRolleZuordnenDialog(zielRolleName);
        });

        await test.step(`"Andere Klasse auswählen" wählen, Zielklasse setzen und Hinweistext prüfen`, async () => {
          await personManagementViewPage.selectAndereKlasseAuswaehlen();
          await personManagementViewPage.selectKlasseInRolleZuordnenDialog(zielKlasseName);
          await personManagementViewPage.checkRolleZuordnenHint(
            'Bitte beachten: Die neue Rolle wird den ausgewählten Schülerinnen und Schülern an der ausgewählten Klasse zugeordnet.',
          );
        });

        await test.step(`"Rolle zuordnen" abschicken und Erfolgsdialog prüfen`, async () => {
          await personManagementViewPage.submitRolleZuordnen();
          await personManagementViewPage.checkRolleZuordnenSuccessDialog();
          await personManagementViewPage.closeDialog('rolle-modify-close-button');
        });

        await test.step(`Aktualisierte Ergebnisliste prüfen: neue Rolle und neue Klasse bei beiden Schülern sichtbar`, async () => {
          await personManagementViewPage.waitForDataLoad();
          await personManagementViewPage.checkRolleAssignedToPersons(zielRolleName, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
          await personManagementViewPage.checkKlasseAssignedToPersons(zielKlasseName, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
        });
      },
    );

    test(
      `Lern-Rolle mehreren Schülern an einer anderen Klasse mit Befristung zuordnen und Profil prüfen`,
      { tag: [DEV] },
      async () => {
        const befristung: string = formatDateDMY(generateCurrentDate({ days: 0, months: 6 }));

        await test.step(`Nach Schule und Quellklasse filtern und beide Schüler auswählen`, async () => {
          await personManagementViewPage.filterAndSelectPersons(schuleName, quellKlasseName, [
            schueler1.nachname,
            schueler2.nachname,
          ]);
        });

        await test.step(`Mehrfachbearbeitung "Rolle zuordnen" öffnen, Schule und Lern-Rolle auswählen`, async () => {
          await personManagementViewPage.selectMehrfachauswahl('Rolle zuordnen');
          await personManagementViewPage.selectSchuleInRolleZuordnenDialog(schuleName);
          await personManagementViewPage.selectRolleInRolleZuordnenDialog(zielRolleName);
        });

        await test.step(`"Andere Klasse auswählen" wählen, Zielklasse setzen und Befristung eingeben`, async () => {
          await personManagementViewPage.selectAndereKlasseAuswaehlen();
          await personManagementViewPage.selectKlasseInRolleZuordnenDialog(zielKlasseName);
          await personManagementViewPage.fillBefristungInRolleZuordnenDialog(befristung);
        });

        await test.step(`"Rolle zuordnen" abschicken und Erfolgsdialog prüfen`, async () => {
          await personManagementViewPage.submitRolleZuordnen();
          await personManagementViewPage.checkRolleZuordnenSuccessDialog();
          await personManagementViewPage.closeDialog('rolle-modify-close-button');
        });

        await test.step(`Schülerprofil öffnen und neue Zuordnung mit Befristung prüfen`, async () => {
          await personManagementViewPage.waitForDataLoad();
          const personDetailsView: PersonDetailsViewPage =
            await personManagementViewPage.openGesamtuebersicht(schueler1.nachname);
          await personDetailsView.checkZuordnungExists({
            dstNr: schuleDstNr,
            organisation: schuleName,
            rolle: zielRolleName,
            klasse: zielKlasseName,
            befristung,
          });
        });
      },
    );

    test(
      `Fehlermeldung bei "Andere Klasse auswählen" mit bereits zugeordneter Lern-Rolle für mehrere Schüler`,
      { tag: [DEV] },
      async () => {
        await test.step(`Nach Schule und Quellklasse filtern und beide Schüler (mit bereits zugeordneter Ziel-Lern-Rolle) auswählen`, async () => {
          await personManagementViewPage.filterAndSelectPersons(schuleName, quellKlasseName, [
            schuelerMitZielRolle1.nachname,
            schuelerMitZielRolle2.nachname,
          ]);
        });

        await test.step(`Mehrfachbearbeitung "Rolle zuordnen" öffnen, Schule und (bereits zugeordnete) Lern-Rolle auswählen`, async () => {
          await personManagementViewPage.selectMehrfachauswahl('Rolle zuordnen');
          await personManagementViewPage.selectSchuleInRolleZuordnenDialog(schuleName);
          await personManagementViewPage.selectRolleInRolleZuordnenDialog(zielRolleName);
        });

        await test.step(`"Andere Klasse auswählen" wählen und Zielklasse setzen`, async () => {
          await personManagementViewPage.selectAndereKlasseAuswaehlen();
          await personManagementViewPage.selectKlasseInRolleZuordnenDialog(zielKlasseName);
        });

        await test.step(`"Rolle zuordnen" abschicken und Fehlerdialog mit beiden Schülern prüfen`, async () => {
          await personManagementViewPage.submitRolleZuordnen();
          await personManagementViewPage.checkRolleZuordnenErrorDialog([
            {
              vorname: schuelerMitZielRolle1.vorname,
              nachname: schuelerMitZielRolle1.nachname,
              username: schuelerMitZielRolle1.username,
            },
            {
              vorname: schuelerMitZielRolle2.vorname,
              nachname: schuelerMitZielRolle2.nachname,
              username: schuelerMitZielRolle2.username,
            },
          ]);
          await personManagementViewPage.closeRolleZuordnenErrorDialog();
        });
      },
    );
  });
});

