import { Download, expect, PlaywrightTestArgs, test } from '@playwright/test';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import {
  addSecondOrganisationToPerson,
  constructPersonenkontextApi,
  createPerson,
  createPersonWithPersonenkontext,
  UserInfo,
} from '../../base/api/personApi';
import { createRolle, addServiceProvidersToRolle, getRolleId } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { RollenArt } from '../../base/api/generated/models/RollenArt';
import { landSH } from '../../base/organisation';
import { landesadminRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
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
import { SchuleCreationSuccessPage } from '../../pages/admin/organisationen/schulen/SchuleCreationSuccess.page';
import {
  SchuleCreationParams,
  SchuleCreationViewPage,
  Schulform,
} from '../../pages/admin/organisationen/schulen/SchuleCreationView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../../pages/components/Header.page';
import {
  createKlassenAndSchuelerForSchulen,
  KlassenAndSchuelerData,
} from '../helpers/createKlassenAndSchuelerForSchulen';

const ROLLE_ENTZIEHEN_TYPES: { rollenArt: RollenArt; bezeichnung: string }[] = [
  { rollenArt: typeLehrer, bezeichnung: 'Lehrkraft (LEHR)' },
  { rollenArt: typeSchueler, bezeichnung: 'Schüler (LERN)' },
];

const ROLLE_ENTZIEHEN_ERROR_TEXT: string =
  'Die Rolle kann diesem Benutzer nicht entzogen werden, da dies die letzte Rollenzuordnung an der Schule ist und er dadurch von der Schule entfernt werden würde. Wenn Sie den Benutzer von der Schule entfernen möchten, führen Sie dies per Einzelbearbeitung (Schulzuordnung entfernen) oder über die Funktion Schulzuordnung(en) aufheben in der Mehrfachbearbeitung aus.';

const ROLLE_ENTZIEHEN_BULK_COUNT: number = 2;

const LERN_ROLLE_ENTZIEHEN_KLASSEN_VARIANTEN: { bezeichnung: string; unterschiedlicheKlassen: boolean }[] = [
  { bezeichnung: 'an derselben Klasse', unterschiedlicheKlassen: false },
  { bezeichnung: 'an unterschiedlichen Klassen', unterschiedlicheKlassen: true },
];

async function createUsersWithRolle(
  page: PlaywrightTestArgs['page'],
  schuleId: string,
  rolleId: string,
  count: number,
  klasseId?: string,
  secondaryRolleId?: string,
): Promise<UserInfo[]> {
  return Promise.all(
    Array.from({ length: count }, () =>
      createPerson(page, schuleId, rolleId, undefined, undefined, undefined, klasseId, undefined, secondaryRolleId),
    ),
  );
}

async function createUsersWithLernRollenInDifferentKlassen(
  page: PlaywrightTestArgs['page'],
  schuleId: string,
  primaryRolleId: string,
  secondaryRolleId: string,
  primaryKlasseId: string,
  secondaryKlasseId: string,
  count: number,
): Promise<UserInfo[]> {
  const personenkontextApi = constructPersonenkontextApi(page);
  const users: UserInfo[] = [];

  for (let index: number = 0; index < count; index++) {
    const response = await personenkontextApi.dbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRaw(
      {
        dbiamCreatePersonWithPersonenkontexteBodyParams: {
          familienname: generateNachname(),
          vorname: generateVorname(),
          createPersonenkontexte: [
            { organisationId: schuleId, rolleId: primaryRolleId },
            { organisationId: primaryKlasseId, rolleId: primaryRolleId },
            { organisationId: schuleId, rolleId: secondaryRolleId },
            { organisationId: secondaryKlasseId, rolleId: secondaryRolleId },
          ],
        },
      },
    );
    expect(response.raw.status).toBe(201);
    const createdPerson = await response.value();

    users.push({
      username: createdPerson.person.username!,
      password: createdPerson.person.startpasswort,
      rolleId: primaryRolleId,
      organisationId: schuleId,
      personId: createdPerson.person.id,
      vorname: createdPerson.person.name.vorname,
      nachname: createdPerson.person.name.familienname,
      kopersnummer: '',
    });
  }

  return users;
}

async function selectUsersAndStartRolleEntziehen(
  personManagementViewPage: PersonManagementViewPage,
  rolleName: string,
  users: UserInfo[],
  options?: { filterByRolle?: boolean; submit?: boolean },
): Promise<void> {
  if (options?.filterByRolle ?? true) {
    await personManagementViewPage.filterByRolle(rolleName);
    await personManagementViewPage.waitForDataLoad();
  }

  for (const user of users) {
    await personManagementViewPage.assertThatPersonExists(user.username);
    await personManagementViewPage.selectPerson(user.username);
    await personManagementViewPage.checkPersonSelected(user.username);
  }

  await personManagementViewPage.selectMehrfachauswahl('Rolle entziehen');
  await personManagementViewPage.checkRolleEntziehenDialog();
  if (options?.submit ?? true) {
    await personManagementViewPage.rolleEntziehen();
  }
}

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
    let admin: UserInfo;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      personManagementViewPage = await loginAndNavigateToAdministration(page);
      // Schule anlegen
      let schuleCreationViewPage: SchuleCreationViewPage =
        await personManagementViewPage.menu.navigateToSchuleCreation();
      schule1Params = {
        name: generateSchulname(),
        dienststellenNr: generateDienststellenNr(),
        schulform: Schulform.Oeffentlich,
      };
      let schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schule1Params);
      await schuleSuccessPage.waitForPageLoad();
      schuleId = await getOrganisationId(page, schule1Params.name);

      const adminOrganisation: string = organisationsName || schule1Params.name;
      admin = await createPersonWithPersonenkontext(page, adminOrganisation, rolleName);

      // für Admins mit mehreren Schulen: zweite Schule anlegen
      if (hasMultipleSchulen) {
        schule2Params = {
          name: generateSchulname(),
          dienststellenNr: generateDienststellenNr(),
          schulform: Schulform.Oeffentlich,
        };
        schuleCreationViewPage = await schuleSuccessPage.goBackToCreateAnotherSchule();
        schuleSuccessPage = await schuleCreationViewPage.createSchule(schule2Params);
        await schuleSuccessPage.waitForPageLoad();
        schuleId2 = await getOrganisationId(page, schule2Params.name);

        const rolleId: string = await getRolleId(page, rolleName);
        await addSecondOrganisationToPerson(page, admin.personId, schuleId, schuleId2, rolleId);
      }

      const landingPage: LandingViewPage = await header.logout();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();

      // Anmeldung mit Passwortänderung
      const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      personManagementViewPage = await startPage.navigateToAdministration();
    });

    test(
      `Als ${bezeichnung}: Schüler versetzen als Mehrfachbearbeitung prüfen`,
      { tag: [STAGE, DEV] },
      async ({ page }: PlaywrightTestArgs) => {
        let testData: KlassenAndSchuelerData[];

        await test.step(`Testdaten erstellen`, async () => {
          testData = await createKlassenAndSchuelerForSchulen(page, [
            { params: schule1Params, schuleId, klassenCount: 26, schuelerCount: 3 },
            ...(hasMultipleSchulen
              ? [{ params: schule2Params, schuleId: schuleId2, klassenCount: 2, schuelerCount: 2 }]
              : []),
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
          await personManagementViewPage.checkRowCount(4);
          await personManagementViewPage.toggleSelectAllRows(true);
          await personManagementViewPage.selectMehrfachauswahl('Schüler versetzen');
          await personManagementViewPage.checkSchuelerVersetzenErrorDialog('rolle');
          await personManagementViewPage.closeDialog('invalid-selection-alert-dialog-cancel-button');
        });

        await test.step(`Nur Schüler auswählen`, async () => {
          await personManagementViewPage.toggleSelectAllRows(false);
          for (const schueler of testData[0].schuelerSchule) {
            await personManagementViewPage.assertThatPersonExists(`${schueler.nachname}`);
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
          await personManagementViewPage.checkNewKlasseNachVersetzen(
            testData[0].schuelerSchule,
            testData[0].klassenNamenSchule[0],
          );
        });
      },
    );

    if (bezeichnung !== 'Schuladmin (2 Schulen)') {
      test(
        `Als ${bezeichnung}: Passwörter zurücksetzen als Mehrfachbearbeitung prüfen`,
        { tag: [STAGE, DEV] },
        async ({ page }: PlaywrightTestArgs) => {
          let testData: KlassenAndSchuelerData[];

          await test.step(`Testdaten erstellen`, async () => {
            testData = await createKlassenAndSchuelerForSchulen(page, [
              { params: schule1Params, schuleId, klassenCount: 1, schuelerCount: 4 },
              ...(hasMultipleSchulen
                ? [{ params: schule2Params, schuleId: schuleId2, klassenCount: 1, schuelerCount: 1 }]
                : []),
            ]);
          });

          if (hasMultipleSchulen) {
            await test.step(`Fehlermeldungen für Schule testen`, async () => {
              await personManagementViewPage.setItemsPerPage(50);
              await personManagementViewPage.toggleSelectAllRows(true);
              await personManagementViewPage.selectMehrfachauswahl('Passwort zurücksetzen');
              await personManagementViewPage.checkPasswortZuruecksetzenErrorDialog();
              await personManagementViewPage.closeDialog('invalid-selection-alert-dialog-cancel-button');
              await personManagementViewPage.filterBySchule(schule1Params.name);
            });
          }

          await test.step(`Passwort zurücksetzen-Dialog prüfen und anschließend zurücksetzen`, async () => {
            await personManagementViewPage.setItemsPerPage(5);
            await personManagementViewPage.checkRowCount(5);
            await personManagementViewPage.toggleSelectAllRows(true);
            await personManagementViewPage.selectMehrfachauswahl('Passwort zurücksetzen');
            await personManagementViewPage.checkPasswortZuruecksetzenDialog();
            await personManagementViewPage.resetPassword();
          });

          await test.step(`Progressbar und Erfolgsdialog prüfen`, async () => {
            await personManagementViewPage.checkPasswortZuruecksetzenInProgress();
            await personManagementViewPage.checkPasswortZuruecksetzenSuccessDialog();
            await personManagementViewPage.closeDialog('password-reset-close-button');
          });

          await test.step(`Hinweis zur Passwortdatei prüfen und anschließend Datei herunterladen `, async () => {
            await personManagementViewPage.checkPasswortdateiHinweis();
            await personManagementViewPage.closeDialog('password-reset-download-confirmation-button');
            const download: Download = await personManagementViewPage.downloadPasswordFile();
            const users: UserInfo[] = [...testData[0].schuelerSchule, admin];
            await personManagementViewPage.checkPasswortdatei(
              download,
              schule1Params.dienststellenNr,
              users,
              hasMultipleSchulen,
            );
            await personManagementViewPage.closeDialog('password-reset-close-button');
          });
        },
      );
    }
  });
});

test.describe('Rolle entziehen als Schuladmin', () => {
  let personManagementViewPage: PersonManagementViewPage;
  let schuleParams: SchuleCreationParams;
  let schuleId: string;
  let admin: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    personManagementViewPage = await loginAndNavigateToAdministration(page);

    const schuleCreationViewPage: SchuleCreationViewPage = await personManagementViewPage.menu.navigateToSchuleCreation();
    schuleParams = {
      name: generateSchulname(),
      dienststellenNr: generateDienststellenNr(),
      schulform: Schulform.Oeffentlich,
    };

    const schuleSuccessPage: SchuleCreationSuccessPage = await schuleCreationViewPage.createSchule(schuleParams);
    await schuleSuccessPage.waitForPageLoad();
    schuleId = await getOrganisationId(page, schuleParams.name);

    admin = await createPersonWithPersonenkontext(page, schuleParams.name, schuladminOeffentlichRolle);
  });

  async function switchToSchuladmin(page: PlaywrightTestArgs['page']): Promise<void> {
    const header: HeaderPage = new HeaderPage(page);
    const landingPage: LandingViewPage = await header.logout();
    const loginPage: LoginViewPage = await landingPage.navigateToLogin();
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
    await startPage.waitForPageLoad();
    personManagementViewPage = await startPage.navigateToAdministration();
    await personManagementViewPage.waitForPageLoad();
  }

  test('Fehler wenn Rolle die einzige Rollenzuordnung ist', { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const stepData: { bezeichnung: string; rolleName: string; users: UserInfo[] }[] = [];

    await test.step('Testdaten erstellen', async () => {
      const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
      for (const { rollenArt, bezeichnung } of ROLLE_ENTZIEHEN_TYPES) {
        const targetRolleName: string = generateRolleName();
        const targetRolleId: string = await createRolle(page, rollenArt, schuleId, targetRolleName);
        await addServiceProvidersToRolle(page, targetRolleId, idSPs);
        const klasseId: string | undefined =
          rollenArt === typeSchueler ? await createKlasse(page, schuleId, generateKlassenname()) : undefined;

        const users: UserInfo[] = await createUsersWithRolle(
          page,
          schuleId,
          targetRolleId,
          ROLLE_ENTZIEHEN_BULK_COUNT,
          klasseId,
        );

        stepData.push({ bezeichnung, rolleName: targetRolleName, users });
      }
    });

    await switchToSchuladmin(page);

    for (const { bezeichnung, rolleName, users } of stepData) {
      await test.step(bezeichnung, async () => {
        await personManagementViewPage.resetFilter();
        await selectUsersAndStartRolleEntziehen(personManagementViewPage, rolleName, users);

        await personManagementViewPage.checkRolleEntziehenInProgress();
        await personManagementViewPage.checkBulkErrorDialog(users.length, ROLLE_ENTZIEHEN_ERROR_TEXT);
        await personManagementViewPage.closeBulkErrorDialog();
      });
    }
  });

  test('Rolle wird erfolgreich entzogen', { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const stepData: { bezeichnung: string; rolleName: string; users: UserInfo[] }[] = [];

    await test.step('Testdaten erstellen', async () => {
      const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
      for (const { rollenArt, bezeichnung } of ROLLE_ENTZIEHEN_TYPES) {
        const targetRolleName: string = generateRolleName();
        const secondaryRolleName: string = generateRolleName();
        const targetRolleId: string = await createRolle(page, rollenArt, schuleId, targetRolleName);
        const secondaryRolleId: string = await createRolle(page, rollenArt, schuleId, secondaryRolleName);
        await addServiceProvidersToRolle(page, targetRolleId, idSPs);
        await addServiceProvidersToRolle(page, secondaryRolleId, idSPs);
        const klasseId: string | undefined =
          rollenArt === typeSchueler ? await createKlasse(page, schuleId, generateKlassenname()) : undefined;

        const users: UserInfo[] = await createUsersWithRolle(
          page,
          schuleId,
          targetRolleId,
          ROLLE_ENTZIEHEN_BULK_COUNT,
          klasseId,
          secondaryRolleId,
        );

        stepData.push({ bezeichnung, rolleName: targetRolleName, users });
      }
    });

    await switchToSchuladmin(page);

    for (const { bezeichnung, rolleName, users } of stepData) {
      await test.step(bezeichnung, async () => {
        await personManagementViewPage.resetFilter();
        await selectUsersAndStartRolleEntziehen(personManagementViewPage, rolleName, users);

        await personManagementViewPage.checkRolleEntziehenInProgress();
        await personManagementViewPage.checkRolleEntziehenSuccessDialog();
        await personManagementViewPage.closeDialog('rolle-unassign-close-button');
      });
    }
  });

  test(
    'Nicht vorhandene LERN-Rolle wird beim Entziehen ignoriert',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      let zugewieseneRolleName: string = '';
      let nichtZugewieseneRolleName: string = '';
      let users: UserInfo[] = [];

      await test.step('Setup', async () => {
        const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
        zugewieseneRolleName = generateRolleName();
        nichtZugewieseneRolleName = generateRolleName();
        const zugewieseneRolleId: string = await createRolle(page, typeSchueler, schuleId, zugewieseneRolleName);
        const nichtZugewieseneRolleId: string = await createRolle(
          page,
          typeSchueler,
          schuleId,
          nichtZugewieseneRolleName,
        );
        await addServiceProvidersToRolle(page, zugewieseneRolleId, idSPs);
        await addServiceProvidersToRolle(page, nichtZugewieseneRolleId, idSPs);

        const klasseId: string = await createKlasse(page, schuleId, generateKlassenname());
        users = await createUsersWithRolle(page, schuleId, zugewieseneRolleId, ROLLE_ENTZIEHEN_BULK_COUNT, klasseId);

        await switchToSchuladmin(page);
      });

      await test.step('Aktion', async () => {
        await personManagementViewPage.resetFilter();
        await personManagementViewPage.waitForDataLoad();
        await selectUsersAndStartRolleEntziehen(personManagementViewPage, zugewieseneRolleName, users, {
          filterByRolle: false,
          submit: false,
        });
        await personManagementViewPage.selectRolleInEntziehenDialog(nichtZugewieseneRolleName);
        await personManagementViewPage.rolleEntziehen();
      });

      await test.step('Verifikation', async () => {
        await personManagementViewPage.checkRolleEntziehenInProgress();
        await personManagementViewPage.checkRolleEntziehenSuccessDialog();
        await personManagementViewPage.closeDialog('rolle-unassign-close-button');
      });
    },
  );

  LERN_ROLLE_ENTZIEHEN_KLASSEN_VARIANTEN.forEach(({ bezeichnung, unterschiedlicheKlassen }) => {
    test(
      `Rolle LERN wird erfolgreich entzogen ${bezeichnung}`,
      { tag: [DEV, STAGE] },
      async ({ page }: PlaywrightTestArgs) => {
        let targetRolleName: string = '';
        let users: UserInfo[] = [];

        await test.step('Setup', async () => {
          const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
          targetRolleName = generateRolleName();
          const secondaryRolleName: string = generateRolleName();
          const targetRolleId: string = await createRolle(page, typeSchueler, schuleId, targetRolleName);
          const secondaryRolleId: string = await createRolle(page, typeSchueler, schuleId, secondaryRolleName);
          await addServiceProvidersToRolle(page, targetRolleId, idSPs);
          await addServiceProvidersToRolle(page, secondaryRolleId, idSPs);

          const primaryKlasseId: string = await createKlasse(page, schuleId, generateKlassenname());
          if (unterschiedlicheKlassen) {
            const secondaryKlasseId: string = await createKlasse(page, schuleId, generateKlassenname());
            users = await createUsersWithLernRollenInDifferentKlassen(
              page,
              schuleId,
              targetRolleId,
              secondaryRolleId,
              primaryKlasseId,
              secondaryKlasseId,
              ROLLE_ENTZIEHEN_BULK_COUNT,
            );
          } else {
            users = await createUsersWithRolle(
              page,
              schuleId,
              targetRolleId,
              ROLLE_ENTZIEHEN_BULK_COUNT,
              primaryKlasseId,
              secondaryRolleId,
            );
          }

          await switchToSchuladmin(page);
        });

        await test.step('Aktion', async () => {
          await personManagementViewPage.resetFilter();
          await selectUsersAndStartRolleEntziehen(personManagementViewPage, targetRolleName, users);
        });

        await test.step('Verifikation', async () => {
          await personManagementViewPage.checkRolleEntziehenInProgress();
          await personManagementViewPage.checkRolleEntziehenSuccessDialog();
          await personManagementViewPage.closeDialog('rolle-unassign-close-button');
        });
      },
    );
  });

  test('Teilerfolg bei gemischten Benutzern', { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const stepData: { bezeichnung: string; rolleName: string; singleRolleUsers: UserInfo[]; allUsers: UserInfo[] }[] = [];

    await test.step('Testdaten erstellen', async () => {
      const idSPs: string[] = [await getServiceProviderId(page, itslearning)];
      for (const { rollenArt, bezeichnung } of ROLLE_ENTZIEHEN_TYPES) {
        const targetRolleName: string = generateRolleName();
        const secondaryRolleName: string = generateRolleName();
        const targetRolleId: string = await createRolle(page, rollenArt, schuleId, targetRolleName);
        const secondaryRolleId: string = await createRolle(page, rollenArt, schuleId, secondaryRolleName);
        await addServiceProvidersToRolle(page, targetRolleId, idSPs);
        await addServiceProvidersToRolle(page, secondaryRolleId, idSPs);
        const klasseId: string | undefined =
          rollenArt === typeSchueler ? await createKlasse(page, schuleId, generateKlassenname()) : undefined;

        const singleRolleUsers: UserInfo[] = await createUsersWithRolle(
          page,
          schuleId,
          targetRolleId,
          ROLLE_ENTZIEHEN_BULK_COUNT,
          klasseId,
        );
        const multiRolleUsers: UserInfo[] = await createUsersWithRolle(
          page,
          schuleId,
          targetRolleId,
          ROLLE_ENTZIEHEN_BULK_COUNT,
          klasseId,
          secondaryRolleId,
        );

        const allUsers: UserInfo[] = [...singleRolleUsers, ...multiRolleUsers];
        stepData.push({ bezeichnung, rolleName: targetRolleName, singleRolleUsers, allUsers });
      }
    });

    await switchToSchuladmin(page);

    for (const { bezeichnung, rolleName, singleRolleUsers, allUsers } of stepData) {
      await test.step(bezeichnung, async () => {
        await personManagementViewPage.resetFilter();
        await selectUsersAndStartRolleEntziehen(personManagementViewPage, rolleName, allUsers);

        await personManagementViewPage.checkRolleEntziehenInProgress();
        await personManagementViewPage.checkBulkErrorDialog(singleRolleUsers.length, ROLLE_ENTZIEHEN_ERROR_TEXT);
        await personManagementViewPage.closeBulkErrorDialog();
      });
    }
  });
});
