import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { getOrganisationId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { addSystemrechtToRolle, createRolle } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import {
  ersatzLandSH,
  landSH,
  oeffentlichLandSH,
  testschuleDstNr,
  testschuleName,
} from '../../base/organisation';
import { landesadminRolle, schuelerRolle, schuladminOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchueler } from '../../base/rollentypen';
import { DEV, STAGE } from '../../base/tags';
import { deletePersonenBySearchStrings, deleteRolleById, deleteRolleByName } from '../../base/testHelperDeleteTestdata';
import { TestHelperLdap } from '../../base/testHelperLdap';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonCreationViewPage } from '../../pages/admin/personen/PersonCreationView.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/PersonDetailsView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../../pages/components/Header.page';
import { MenuPage } from '../../pages/components/MenuBar.page';
import { LandingPage } from '../../pages/LandingView.page';
import { LoginPage } from '../../pages/LoginView.page';
import { StartViewPage as NewStartPage } from '../../pages/StartView.neu.page';
import { StartPage } from '../../pages/StartView.page';

const LDAP_URL: string = process.env.LDAP_URL;
const LDAP_ADMIN_PASSWORD: string = process.env.LDAP_ADMIN_PASSWORD;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let rolleNames: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);

      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
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
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  test(
    'Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden und einen weiteren Benutzer anlegen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const login: LoginPage = new LoginPage(page);
      const header: HeaderPage = new HeaderPage(page);
      const landing: LandingPage = new LandingPage(page);

      const vorname: string = generateVorname();
      const nachname: string = generateNachname();
      const schulstrukturknoten: string = testschuleName;
      const rolle: string = 'Lehrkraft';
      let userInfo: UserInfo;

      await test.step(`Schuladmin anlegen und mit diesem anmelden`, async () => {
        const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];
        userInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          schulstrukturknoten,
          'LEIT',
          nachname,
          vorname,
          idSPs,
          generateRolleName()
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');

        usernames.push(userInfo.username);
        rolleIds.push(userInfo.rolleId);

        await header.logout({ logoutViaStartPage: true });
        await landing.buttonAnmelden.click();
        await login.login(userInfo.username, userInfo.password);
        userInfo.password = await login.updatePW();
        await startseite.validateStartPageIsLoaded();
        currentUserIsLandesadministrator = false;
      });

      await test.step(`Weiteren Nutzer anlegen`, async () => {
        const newVorname: string = generateVorname();
        const newNachname: string = generateNachname();
        const newKopersnr: string = generateKopersNr();
        const newStartPage: NewStartPage = new NewStartPage(page);
        await newStartPage.navigateToAdministration();
        const menu: MenuPage = new MenuPage(page);
        const personCreationView: PersonCreationViewPage = await menu.personAnlegen();
        await expect(personCreationView.textH2PersonAnlegen).toHaveText('Neuen Benutzer hinzufügen');
        await personCreationView.comboboxRolle.click();
        await page.getByText(rolle, { exact: true }).click();
        await personCreationView.inputVorname.fill(newVorname);
        await personCreationView.inputNachname.fill(newNachname);
        await personCreationView.inputKopersnr.fill(newKopersnr);
        await personCreationView.buttonPersonAnlegen.click();
        await expect(personCreationView.textSuccess).toBeVisible();

        // Save the username for cleanup
        usernames.push(await personCreationView.dataBenutzername.innerText());
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

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
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
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
      logoutViaStartPage = true;
    }
  );
});
