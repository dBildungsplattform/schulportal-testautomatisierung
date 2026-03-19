import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { getOrganisationId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { addSystemrechtToRolle, createRolle } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import {
  ersatzLandSH,
  landSH,
  oeffentlichLandSH,
  testschuleName,
} from '../../base/organisation';
import { landesadminRolle, schuelerRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler } from '../../base/rollentypen';
import { DEV, STAGE } from '../../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById, deleteRolleByName } from '../../base/testHelperDeleteTestdata';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonCreationViewPage } from '../../pages/admin/personen/PersonCreationView.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { MenuPage } from '../../pages/components/MenuBar.page';
import { LandingPage } from '../../pages/LandingView.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let rolleNames: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);

      await header.logout();
      await loginAndNavigateToAdministration(page);
    }

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }

      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
      }

      if (rolleNames.length > 0) {
        await deleteRolleByName(rolleNames, page);
        rolleNames = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.logout();
    });
  });

  test(
    "Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin",
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const OrganisationLand: string = landSH;
      const OrganisationOeffentlicheSchule: string = oeffentlichLandSH;
      const OrganisationErsatzschule: string = ersatzLandSH;
      const OrganisationSchule: string = testschuleName;

      const rolleLehr: string = 'Lehrkraft';
      const rolleLiV: string = 'LiV';

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog Person anlegen öffnen`, async () => {
        const menu: MenuPage = new MenuPage(page);
        return await menu.personAnlegen();
      });

      await test.step(`Organisation 'Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationLand, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Öffentliche Schulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationOeffentlicheSchule, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Ersatzschulen Land Schleswig-Holstein' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationErsatzschule, true);
        await personCreationView.checkRolleModal(
          [landesadminRolle],
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle]
        );
        await personCreationView.clearOrganisationSelection();
      });

      await test.step(`Organisation 'Schule' auswählen und Dropdown 'Rolle' prüfen`, async () => {
        await personCreationView.searchAndSelectOrganisation(OrganisationSchule, false);
        await personCreationView.checkRolleModal(
          [rolleLehr, rolleLiV, schuladminOeffentlichRolle, schuelerRolle],
          [landesadminRolle]
        );
      });
    }
  );

  test(
    `Bei Nutzerneuanlage prüfen, dass die combobox 'Rolle' nach Auswahl einer Rolle, nur noch Rollen der gleichen Rollenart angeboten werden`,
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const rolleNames: string[] = [];

      await test.step(`Testdaten: Je 2 Rollen mit Rollenarten LEHR und LERN über die api anlegen`, async () => {
        const idSchule: string = await getOrganisationId(page, testschuleName);

        for (let i: number = 0; i <= 4; i++) {
          rolleNames.push(generateRolleName());
        }

        rolleIds.push(await createRolle(page, typeLehrer, idSchule, rolleNames[0]));
        rolleIds.push(await createRolle(page, typeLehrer, idSchule, rolleNames[1]));
        rolleIds.push(await createRolle(page, typeSchueler, idSchule, rolleNames[2]));
        rolleIds.push(await createRolle(page, typeSchueler, idSchule, rolleNames[3]));
      });

      const personCreationView: PersonCreationViewPage = await test.step(`Dialog "Person anlegen" öffnen`, async () => {
        const menu: MenuPage = new MenuPage(page);
        return await menu.personAnlegen();
      });

      await test.step(`In der Combobox 'Organisation' eine Schule auswählen`, async () => {
        await personCreationView.searchAndSelectOrganisation(testschuleName, false);
      });

      await test.step(`In der Combobox 'Rolle' 2 Rollen vom Typ LEHR selektieren und prüfen, dass danach keine Rollen mehr vom Type LERN angezeigt werden in der Combobox`, async () => {
        await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[0], true);
        await personCreationView.comboboxRolleInput.searchByTitle(rolleNames[1], true);
        await personCreationView.comboboxRolleInput.validateItemNotExists(rolleNames[2], true);
        await personCreationView.comboboxRolleInput.validateItemNotExists(rolleNames[3], true);
      });
    }
  );
});
