import { PlaywrightTestArgs, test } from '@playwright/test';
import { createKlasse, getOrganisationId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { testschuleDstNr, testschuleName } from '../../base/organisation';
import { typeSchueler } from '../../base/rollentypen';
import { itslearning } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { ZuordnungenPage } from '../../pages/admin/personen/details/Zuordnungen.page';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';

test.describe(`Schüler versetzen, Umgebung ${process.env.ENV}, URL: ${process.env.FRONTEND_URL}`, () => {
  let userInfoSchueler: UserInfo;
  let rolleName: string;
  let klasseNameCurrent: string;
  let klasseNameNew: string;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Anmelden', async () => {
      await loginAndNavigateToAdministration(page);
    });

    await test.step('Rollennamen und Klassennamen generieren', async () => {
      rolleName = generateRolleName();
      klasseNameCurrent = generateKlassenname();
      klasseNameNew = generateKlassenname();
    });

    await test.step('Schüler in aktueller Klasse anlegen, neue Zielklasse erstellen', async () => {
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
        klasseIdCurrent,
      );
      await createKlasse(page, idSchule, klasseNameNew);
    });
  });

  test('von einer Klasse in eine andere', { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht Schüler öffnen', async () => {
      const startPage: StartViewPage = new StartViewPage(page);
      const personManagementView: PersonManagementViewPage = await startPage
        .navigateToAdministration()
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
        klasse: klasseNameNew,
      });
    });
  });
});
