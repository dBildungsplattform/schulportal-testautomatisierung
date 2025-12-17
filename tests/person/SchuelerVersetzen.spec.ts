import { describe } from 'node:test';
import { PlaywrightTestArgs, test } from '@playwright/test';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname
} from '../../base/utils/generateTestdata';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { testschuleDstNr, testschuleDstNrUndName, testschuleName } from '../../base/organisation';
import { typeSchueler } from '../../base/rollentypen';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { itslearning } from '../../base/sp';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { ZuordnungenPage } from '../../pages/admin/personen/details/Zuordnungen.page';
import { DEV, LONG, SHORT, STAGE } from '../../base/tags';

describe(`Schüler versetzen, Umgebung ${process.env.ENV}, URL: ${process.env.FRONTEND_URL}`, () => {
    test(
      'von einer Klasse in eine andere',
      { tag: [LONG, SHORT, STAGE, DEV] },
      async ({ page }: PlaywrightTestArgs) => {
        const rolleName: string = generateRolleName();
        const klasseNameCurrent: string = generateKlassenname();
        const klasseNameNew: string = generateKlassenname();

        const userInfoSchueler: UserInfo = await test.step('Schüler mit Rolle und 2 Klassen anlegen', async () => {
          const idSchule: string = await getOrganisationId(page, testschuleDstNrUndName);
          const klasseIdCurrent: string = await createKlasse(page, idSchule, klasseNameCurrent);
          await createKlasse(page, idSchule, klasseNameNew);
          return await createRolleAndPersonWithPersonenkontext(
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
        });

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht Schüler öffnen `, async () => {
          const startPage: StartViewPage = new StartViewPage(page);
          const personManagementView: PersonManagementViewPage = await startPage
            .goToAdministration()
            .then((p: PersonManagementViewPage) => p.menu).then((menu: MenuBarPage) => menu.navigateToPersonManagement());
          return await personManagementView.searchAndOpenGesamtuebersicht(userInfoSchueler.username);
        });

        await test.step('Schüler versetzen', async () => {
          await personDetailsView.editZuordnungen()
            .then((z: ZuordnungenPage) => z.changeKlasse(klasseNameCurrent, klasseNameNew) );
        });

        await test.step('In der Gesamtübersicht prüfen, dass der Schüler in die neue Klasse versetzt worden ist', async () => {
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