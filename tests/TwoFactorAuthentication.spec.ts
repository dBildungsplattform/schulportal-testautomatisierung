import test, { expect, Page } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { LONG } from '../base/tags';
import { generateNachname, generateVorname, generateRolleName } from '../base/testHelperGenerateTestdataNames';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { testschule } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { email } from '../base/sp';
import { gotoTargetURL } from '../base/testHelperUtils';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { HeaderPage } from '../pages/Header.page.ts';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata.ts';
import FromAnywhere from '../pages/FromAnywhere';

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für TwoFactorAuthentication": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let startseite: StartPage;

  test.beforeEach(async ({ page }) => {
    startseite = await test.step(`Login`, async () => {
      const startPage = await FromAnywhere(page)
        .start()
        .then((landing) => landing.goToLogin())
        .then((login) => login.login())
        .then((startseite) => startseite.checkHeadlineIsVisible());
  
      return startPage;
    });
  });

  test.afterEach(async ({ page }: { page: Page }) => {
    const header: HeaderPage = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const startseite: StartPage = new StartPage(page);
    const login: LoginPage = new LoginPage(page);

    await header.logout();
    await landing.button_Anmelden.click();
    await login.login(ADMIN, PW);
    await startseite.checkHeadlineIsVisible();

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (username.length > 0) {
        await deletePersonenBySearchStrings(page, username);
        username = [];
      }
      if (rolleId.length > 0) {
        await deleteRolleById(rolleId, page);
        rolleId = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      await header.logout();
    });
  });

  test('Prüfen, ob es möglich ist einen Token zurückzusetzen', { tag: [LONG] }, async ({ page }: { page: Page }) => {
    let userInfoLehrer: UserInfo;

    await test.step(`Testdaten erstellen`, async () => {
      userInfoLehrer = await createRolleAndPersonWithUserContext(
        page,
        testschule,
        typeLehrer,
        await generateNachname(),
        await generateVorname(),
        [await getSPId(page, email)],
        await generateRolleName()
      );
      username.push(userInfoLehrer.username);
      rolleId.push(userInfoLehrer.rolleId);
    });

    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

    const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
      await gotoTargetURL(page, 'admin/personen');
      await personManagementView.searchBySuchfeld(userInfoLehrer.username);
      return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
    });

    await test.step(`Token einrichten`, async () => {
      await personDetailsView.softwareTokenEinrichten();
    });

    await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
      await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
      await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
    });

    await test.step(`Token zurücksetzen`, async () => {
      await expect(personDetailsView.button_2FAEinrichten).toHaveText('Token zurücksetzen');
      await personDetailsView.button_2FAEinrichten.click();

      await expect(personDetailsView.button_2FA_Zuruecksetzen_Weiter).toHaveText('Zurücksetzen');
      await personDetailsView.button_2FA_Zuruecksetzen_Weiter.click();

      await expect(personDetailsView.button_2FA_Zuruecksetzen_Weiter).toHaveText('Schließen');
      await personDetailsView.button_2FA_Zuruecksetzen_Weiter.click();

      await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
    });
  });
});
