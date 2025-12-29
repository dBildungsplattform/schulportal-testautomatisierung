import { PlaywrightTestArgs, test } from '@playwright/test';

import { createPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { testschuleName } from '../../base/organisation';
import { lehrkraftOeffentlichRolle } from '../../base/rollen';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

test.describe(`Testfälle für das Personen löschen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let userInfo: UserInfo;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const landing: LandingViewPage = await FromAnywhere(page).start();
      const login: LoginViewPage = await landing.navigateToLogin();
      const startseite: StartViewPage = await login.login(ADMIN, PW);
      await startseite.serviceProvidersAreLoaded();
      await startseite.navigateToAdministration();
    });

    await test.step(`Daten anlegen`, async () => {
      userInfo = await createPersonWithPersonenkontext(page, testschuleName, lehrkraftOeffentlichRolle);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    await header.logout();
  });

  test('Person via Gesamtübersicht löschen', async ({ page }: PlaywrightTestArgs) => {
    const personDetailsViewPage: PersonDetailsViewPage = await test.step(`Zur Gesamtübersicht navigieren`, async () => {
      const personenManagementViewPage: PersonManagementViewPage = new PersonManagementViewPage(page);
      await personenManagementViewPage.waitForPageLoad();
      return personenManagementViewPage.searchAndOpenGesamtuebersicht(userInfo.username);
    });

    const personenManagementViewPage: PersonManagementViewPage = await test.step(`Person löschen`, async () => {
      return personDetailsViewPage.deletePerson({ clearFilter: true });
    });

    await test.step(`Löschung verifizieren`, async () => {
      await personenManagementViewPage.searchByText(userInfo.username);
      await personenManagementViewPage.checkIfPersonNotExists(userInfo.username);
    });
  });
});
