import { test, expect, PlaywrightTestArgs } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { LONG, STAGE, BROWSER } from '../base/tags';
import { generateNachname, generateVorname, generateRolleName } from '../base/testHelperGenerateTestdataNames';
import { testschuleName } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { email } from '../base/sp';
import { gotoTargetURL } from '../base/testHelperUtils';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { HeaderPage } from '../pages/Header.page.ts';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata.ts';
import FromAnywhere from '../pages/FromAnywhere';
import { StartPage } from '../pages/StartView.page.ts';
import { LandingPage } from '../pages/LandingView.page.ts';
import { LoginPage } from '../pages/LoginView.page.ts';

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für TwoFactorAuthentication": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }
      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
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
    'Prüfen, ob es möglich ist einen Token zurückzusetzen',
    { tag: [LONG, STAGE, BROWSER] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten erstellen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithUserContext(
          page,
          testschuleName,
          typeLehrer,
          await generateNachname(),
          await generateVorname(),
          [await getSPId(page, email)],
          await generateRolleName()
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
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
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });

      await test.step(`Token zurücksetzen`, async () => {
        await expect(personDetailsView.button2FAEinrichten).toHaveText('Token zurücksetzen');
        await personDetailsView.button2FAEinrichten.click();

        await expect(personDetailsView.button2FAZuruecksetzenWeiter).toHaveText('Zurücksetzen');
        await personDetailsView.button2FAZuruecksetzenWeiter.click();

        await expect(personDetailsView.button2FAZuruecksetzenWeiter).toHaveText('Schließen');
        await personDetailsView.button2FAZuruecksetzenWeiter.click();

        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
