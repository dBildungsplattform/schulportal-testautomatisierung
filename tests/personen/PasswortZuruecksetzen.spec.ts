import { test, PlaywrightTestArgs } from '@playwright/test';
import { createPersonWithPersonenkontext, freshLoginPage, UserInfo } from '../../base/api/personApi';
import { STAGE, DEV} from '../../base/tags';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { testschuleName } from '../../base/organisation';
import { lehrkraftOeffentlichRolle } from '../../base/rollen';
import { generateKopersNr } from '../../base/utils/generateTestdata';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';

test.describe('Passwort-Reset für Lehrer', () => { 

  let lehrkraft: UserInfo;
  let personManagementViewPage: PersonManagementViewPage;
  let loginPage: LoginViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(process.env.USER as string, process.env.PW as string);
    await startPage.waitForPageLoad();
    lehrkraft = await createPersonWithPersonenkontext(
      page,
      testschuleName,
      lehrkraftOeffentlichRolle,
      undefined,
      undefined,
      generateKopersNr()
    );
    personManagementViewPage = await startPage.goToAdministration();
  });

  test('Passwort Reset für einen Lehrer als Landesadmin',{ tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
    const personDetails: PersonDetailsViewPage = await personManagementViewPage.searchAndOpenGesamtuebersicht(lehrkraft.nachname);
    const newPassword: string = await personDetails.resetPasswordAndCopyNew();

    const header: HeaderPage = new HeaderPage(page);
    const landingPage: LandingViewPage = await header.logout();
    loginPage = await landingPage.navigateToLogin();
    const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
      lehrkraft.username,
      newPassword
    );
    await startPage.waitForPageLoad();
    }
  );
});