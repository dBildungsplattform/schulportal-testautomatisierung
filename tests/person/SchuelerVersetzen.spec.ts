import { describe } from 'node:test';
import { PlaywrightTestArgs, test } from '@playwright/test';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname
} from '../../base/utils/generateTestdata';
import { createRolleAndPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { testschuleDstNr, testschuleName } from '../../base/organisation';
import { typeSchueler } from '../../base/rollentypen';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { itslearning } from '../../base/sp';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { ZuordnungenPage } from '../../pages/admin/personen/details/Zuordnungen.page';
import { DEV, LONG, SHORT, STAGE } from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

describe(`Schüler versetzen, Umgebung ${process.env.ENV}, URL: ${process.env.FRONTEND_URL}`, () => {
    let userInfoSchueler: UserInfo;
    let rolleName: string;
    let klasseNameCurrent: string;
    let klasseNameNew: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      await test.step('Anmelden', async () => {
        const loginPage: LoginViewPage = await freshLoginPage(page);
        const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
        await startPage.waitForPageLoad();
      });

      await test.step('Rollennamen und Klassennamen generieren', async () => {
        rolleName = generateRolleName();
        klasseNameCurrent = generateKlassenname();
        klasseNameNew = generateKlassenname();
      });

      await test.step('Schüler mit Rolle und 2 Klassen anlegen', async () => {
        const idSchule: string = await getOrganisationId(page, testschuleName);
        const klasseIdCurrent: string = await createKlasse(page, idSchule, klasseNameCurrent);
        
        userInfoSchueler = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeSchueler,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, itslearning)],
          rolleName,
          undefined,
          klasseIdCurrent
        );
        await createKlasse(page, idSchule, klasseNameNew);
      });
    });

    test(
      'von einer Klasse in eine andere',
      { tag: [LONG, SHORT, STAGE, DEV] },
      async ({ page }: PlaywrightTestArgs) => {
        const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht Schüler öffnen', async () => {
          const startPage: StartViewPage = new StartViewPage(page);
          const personManagementView: PersonManagementViewPage = await startPage
            .goToAdministration()
            .then((p: PersonManagementViewPage) => p.menu)
            .then((menu: MenuBarPage) => menu.navigateToPersonManagement());
          return await personManagementView.searchAndOpenGesamtuebersicht(userInfoSchueler.username);
        });

        await test.step('Schüler in neue Klasse versetzen', async () => {
                  const zuordnungenPage: ZuordnungenPage = new ZuordnungenPage(page);
                  await zuordnungenPage.changeKlasse(testschuleDstNr, testschuleName, rolleName, klasseNameCurrent, klasseNameNew);
                });

        await test.step('Prüfen, dass Schüler in neuer Klasse zugeordnet ist', async () => {
          await personDetailsView.checkZuordnungExists({
            dstNr: testschuleDstNr,
            organisation: testschuleName,
            rolle: rolleName,
            klasse: klasseNameNew
          });
        });
      }
    );
  }
);
