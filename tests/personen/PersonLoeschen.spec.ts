import { PlaywrightTestArgs, test } from '@playwright/test';
import { createRolleAndPersonWithPersonenkontext } from '../../base/api/personApi';
import { RollenArt } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { landSH } from '../../base/organisation';
import { BROWSER, DEV, LONG, SHORT, STAGE } from '../../base/tags';
import { generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { schulportaladmin } from '../../base/sp';

test.describe(`Testfälle für das Löschen von Benutzern: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    const startView: StartViewPage = await test.step('Login', async () => {
      const landing: LandingViewPage = await FromAnywhere(page).start();
      const login: LoginViewPage = await landing.navigateToLogin();
      const startseite: StartViewPage = await login.login(process.env.USER!, process.env.PW!);
      return startseite.waitForPageLoad();
    });
    const personManagementView: PersonManagementViewPage = await startView.goToAdministration();
    await personManagementView.waitForPageLoad();

    const vorname = generateVorname();
    const nachname = generateNachname();
    const rolle = generateRolleName();
    const berechtigung: RollenArt = RollenArt.Sysadmin;
    const idSPs = [await getServiceProviderId(page, schulportaladmin)];

    await test.step('Neuen Benutzer über die API anlegen', async () => {
      await createRolleAndPersonWithPersonenkontext(page, landSH, berechtigung, nachname, vorname, idSPs, rolle);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    const header: HeaderPage = new HeaderPage(page);
    await header.logout();
  });

  test(
    'Einen Benutzer über das FE löschen',
    { tag: [LONG, SHORT, STAGE, DEV, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      await test.step('Benutzer wieder löschen über das FE', async () => {
        await personManagementView.waitForPageLoad();
        const personDetailsView: PersonDetailsViewPage = await personManagementView.searchAndOpenGesamtuebersicht(
          nachname
        );
        await personDetailsView.deletePerson();
        await personManagementView.resetSearch();
        await personManagementView.search(nachname);
        await personManagementView.checkIfPersonNotExists(nachname);
      });
    }
  );
});
