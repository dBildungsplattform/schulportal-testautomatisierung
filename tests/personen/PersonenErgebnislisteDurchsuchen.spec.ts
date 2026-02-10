import { PlaywrightTestArgs, test } from '@playwright/test';

import { addSecondOrganisationToPerson, createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { landSH, testschuleDstNr, testschuleName } from '../../base/organisation';
import { landesadminRolle, lehrkraftOeffentlichRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { generateDienststellenNr, generateKlassenname, generateKopersNr, generateNachname, generateSchulname, generateVorname } from '../../base/utils/generateTestdata';
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
      if(rolleName === schuladminOeffentlichRolle){
        await addSecondOrganisationToPerson(page, admin.personId, schuleId1, schuleId2, rolleId);
      }
      landingPage = await header.logout();
      landingPage.navigateToLogin();

      // Erstmalige Anmeldung mit Passwortänderung
      await loginPage.loginNewUserWithPasswordChange(admin.username, admin.password);
      await startPage.waitForPageLoad();

      personManagementViewPage = await startPage.goToAdministration();
      await personManagementViewPage.waitForPageLoad();
    });

    test.describe('UI-Tests ohne Datenanlage', () => {

      // SPSH-2923
      test(`Als ${bezeichnung}: Benutzer Ergebnisliste: UI prüfen`, { tag: [STAGE, DEV] }, async () => {
        await personManagementViewPage.checkManagementPage();
      });

      // SPSH-2925
      test.describe(`Als ${bezeichnung}: In der Ergebnisliste die Suchfunktion benutzen`, { tag: [STAGE, DEV] }, async () => {
          for (const [key, getValue] of [
            ['Nachname', (): string => admin.nachname],
            ['Vorname', (): string => admin.vorname],
            ['Benutzername', (): string => admin.username],
            ['Kopersnummer', (): string => admin.kopersnummer],
          ] as [string, () => string][]) {
            test(`Suche nach ${key}`, async () => {
              const value: string = getValue();
              await personManagementViewPage.searchByText(value);
              await personManagementViewPage.checkIfPersonExists(value);
            });
          }

          // searching for rolle in search-field makes no sense
          test(`Suche nach Rolle`, async () => {
            await personManagementViewPage.filterByRolle(rolleName);
            await personManagementViewPage.checkIfRolleIsCorrect(rolleName);
          });

          test(`Suche nach einem nicht existierenden Eintrag`, async () => {
            await personManagementViewPage.searchByText('NichtExistierenderEintrag');
            await personManagementViewPage.checkIfPersonExists('Keine Daten gefunden.');
            await personManagementViewPage.checkRowCount(0);
          });
        }
      );

      // SPSH-2926
      test(
        `Als ${bezeichnung}: In der Ergebnisliste die Filterfunktion der Schulen benutzen`,
        { tag: [STAGE, DEV] },
        async () => {
          if(rolleName === schuladminOeffentlichRolle){
          await personManagementViewPage.filterBySchule(organisationsName, false);
          } else {
            // The searchstring for land matches multiple organisations, so we need to use exactMatch=true
          await personManagementViewPage.filterBySchule(organisationsName, true);
          }
          await personManagementViewPage.checkIfSchuleIsCorrect(organisationsName, dienststellenNr);
        }
      );
    });

    test.describe('Mit Klassendatenanlage', () => {
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

      // SPSH-3056
      test.describe('Klassenfilter-Tests', () => {
        test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anzeigen`, { tag: [STAGE, DEV] }, async () => {
          await personManagementViewPage.filterBySchule(schuleParams.name);
          await personManagementViewPage.checkVisibleDropdownOptions(klassenNamen, 'personen-management-klasse-select', true, true);
        });

        test(`Als ${bezeichnung}: Alle Klassen im Drop-Down des Klassenfilters anklickbar`, { tag: [STAGE, DEV] }, async () => {
          await personManagementViewPage.filterBySchule(schuleParams.name);
          await personManagementViewPage.checkAllDropdownOptionsClickable(klassenNamen);
        });
      });
    });     
    
    if (rolleName === landesadminRolle) {
      test.describe('Mit Personendatenanlage', () => {

        test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
          // 5 Personen anlegen zum Sortieren 
          for (let i: number = 0; i < 5; i++) {
            await createPersonWithPersonenkontext(
              page,
              schuleParams.name,
              lehrkraftOeffentlichRolle,
              generateVorname(),
              generateNachname(),
              generateKopersNr()
            );
          }
        });
          // SPSH-2174
          test.describe('Sortierungs-Tests', () => {
            test(`Als ${bezeichnung}: Ergebnisliste Benutzer nach Spalten sortieren können`, { tag: [DEV, STAGE] }, async () => {
              await test.step(`Schule filtern`, async () => {
                await personManagementViewPage.setItemsPerPage(5);
                await personManagementViewPage.filterBySchule(schuleParams.name);
                await personManagementViewPage.waitForDataLoad();
              });

              for (const column of [
                { name: 'Nachname', cellIndex: 1 },
                { name: 'Vorname', cellIndex: 2 },
                { name: 'Benutzername', cellIndex: 3 },
                { name: 'KoPers.-Nr.', cellIndex: 4 },
              ] as const) {
                await test.step(`Sortierverhalten Spalte ${column.name} prüfen`, async () => {
                  // Spaltenkopf muss einmal angeklickt werden (da standardmäßig nach Nachname sortiert ist)
                  if (column.name !== 'Nachname') {
                    await personManagementViewPage.toggleColumnSort(column.name);
                  }
                  await personManagementViewPage.checkIfColumnDataSorted(column.cellIndex, 'ascending');
                  await personManagementViewPage.toggleColumnSort(column.name);
                  await personManagementViewPage.checkIfColumnDataSorted(column.cellIndex, 'descending');

                  await personManagementViewPage.toggleColumnSort(column.name);
                  await personManagementViewPage.checkIfColumnDataSorted(column.cellIndex, 'ascending');            
                });
              }
            });

            test(`Als ${bezeichnung}: Ergebnisliste Benutzer: nicht sortierbare Spalten prüfen`, { tag: [DEV, STAGE] }, async () => {
              await test.step(`Püfen, dass kein Sortier-Icon vorhanden ist`, async () => {
                await personManagementViewPage.checkIfColumnHeaderSorted('Rolle', 'not-sortable');
                await personManagementViewPage.checkIfColumnHeaderSorted('Schulzuordnung(en)', 'not-sortable');
                await personManagementViewPage.checkIfColumnHeaderSorted('Klasse', 'not-sortable');
              });
            });
          });
      });
    }


    });   
});
