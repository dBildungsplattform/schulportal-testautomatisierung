import { test, expect, PlaywrightTestArgs } from '@playwright/test';
import { UserInfo } from '../base/api/testHelper.page.ts';
import { createRolleAndPersonWithUserContext } from '../base/api/testHelperPerson.page';
import { getSPId } from '../base/api/testHelperServiceprovider.page';
import { LONG } from '../base/tags';
import { generateNachname, generateVorname, generateRolleName } from '../base/testHelperGenerateTestdataNames';
import { testschule } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { email } from '../base/sp';
import { gotoTargetURL } from '../base/testHelperUtils';
import { PersonDetailsViewPage } from '../pages/admin/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/PersonManagementView.page';
import { HeaderPage } from '../pages/Header.page.ts';
import { deletePersonenBySearchStrings, deleteRolleById } from '../base/testHelperDeleteTestdata.ts';
import FromAnywhere from '../pages/FromAnywhere';

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];

test.describe(`Testfälle für TwoFactorAuthentication": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage = await FromAnywhere(page)
        .start()
        .then((landing) => landing.goToLogin())
        .then((login) => login.login())
        .then((startseite) => startseite.checkHeadlineIsVisible());
  
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
      await header.logout();
    });
  });

  test('Prüfen, ob es möglich ist einen Token zurückzusetzen', { tag: [LONG] }, async ({ page }: PlaywrightTestArgs) => {
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
