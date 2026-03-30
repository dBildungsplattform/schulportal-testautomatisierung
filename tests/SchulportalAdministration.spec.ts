import { expect, PlaywrightTestArgs, test } from '@playwright/test';

import { createRolleAndPersonWithPersonenkontext, setTimeLimitPersonenkontext, UserInfo } from '../base/api/personApi';
import { testschuleName } from '../base/organisation';
import { typeLehrer } from '../base/rollentypen';
import { DEV, STAGE } from '../base/tags';
import { deletePersonById, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { loginAndNavigateToAdministration } from '../base/testHelperUtils';
import {
  formatDateDMY,
  generateCurrentDate,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../base/utils/generateTestdata';
import { HeaderPage } from '../pages/components/Header.neu.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';

// The created test data will be deleted in the afterEach block
let personIds: string[] = [];
let rolleIds: string[] = [];

// This variable must be set to false in the testcase when the logged in user is changed
let currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für Schulportal Administration": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);

      await header.logout();
      await loginAndNavigateToAdministration(page);
    }

    await test.step(`Testdaten löschen via API`, async () => {
      if (personIds.length > 0) {
        await deletePersonById(personIds, page);
        personIds = [];
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

  test(
    'News-Box bei befristeten Schulzuordnungen testen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer1: UserInfo;
      let userInfoLehrer2: UserInfo;
      const rollenNameLehrer1 = generateRolleName();
      const rollenNameLehrer2: string = generateRolleName();
      const colorOrange: string = 'rgb(255, 152, 37)';
      const colorRed: string = 'rgb(255, 85, 85)';

      const headerPage: HeaderPage = new HeaderPage(page);
      const loginPage: LoginViewPage = new LoginViewPage(page);

      await test.step(`Testdaten: Lehrer1 mit einer befristeten Schulzuordnung(noch 50 Tage gültig) und Lehrer2 mit einer befristeten Schulzuordnung(noch 12 Tage gültig) über die api anlegen`, async () => {
        // Lehrer1: Schulzuordnung noch 50 Tage gültig
        userInfoLehrer1 = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [],
          rollenNameLehrer1,
        );
        personIds.push(userInfoLehrer1.personId);
        rolleIds.push(userInfoLehrer1.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer1.personId,
          userInfoLehrer1.organisationId,
          userInfoLehrer1.rolleId,
          generateCurrentDate({ days: 50, months: 0 }),
        );

        // Lehrer2: Schulzuordnung noch 12 Tage gültig
        userInfoLehrer2 = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [],
          rollenNameLehrer2,
        );
        personIds.push(userInfoLehrer2.personId);
        rolleIds.push(userInfoLehrer2.rolleId);

        await setTimeLimitPersonenkontext(
          page,
          userInfoLehrer2.personId,
          userInfoLehrer2.organisationId,
          userInfoLehrer2.rolleId,
          generateCurrentDate({ days: 12, months: 0 }),
        );
      });

      await test.step(`Lehrer1 meldet sich an und die orangene News-Box wird geprüft`, async () => {
        const timeLimitTeacherRolle1: string = formatDateDMY(generateCurrentDate({ days: 50, months: 0 }));
        const alertText: string =
          `Hinweis: Die Zuordnung dieses Benutzerkontos zu der Schule "${testschuleName}" mit der Rolle "${rollenNameLehrer1}" ist bis zum ${timeLimitTeacherRolle1} befristet. ` +
          `Sollte dies nicht zutreffen, wenden Sie sich bitte an Ihre Schulleitung. Nach Ende der Zuordnung sind Funktionalitäten, die im Bezug zu dieser Schule und Rolle stehen, nicht mehr verfügbar.`;

        await headerPage.logout();
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.buttonAnmelden.click();
        const startView: StartViewPage = await loginPage.login(userInfoLehrer1.username, userInfoLehrer1.password);
        await loginPage.updatePassword();
        await startView.waitForPageLoad();
        currentUserIsLandesadministrator = false;

        await expect(page.getByText(alertText)).toBeVisible();
        await expect(page.getByRole('alert')).toHaveCSS('background-color', colorOrange);
      });

      await test.step(`Lehrer2 meldet sich an und die rote News-Box wird geprüft`, async () => {
        const timeLimitTeacherRolle2: string = formatDateDMY(generateCurrentDate({ days: 12, months: 0 }));
        const alertText: string =
          `Hinweis: Die Zuordnung dieses Benutzerkontos zu der Schule "${testschuleName}" mit der Rolle "${rollenNameLehrer2}" ist bis zum ${timeLimitTeacherRolle2} befristet. ` +
          `Sollte dies nicht zutreffen, wenden Sie sich bitte an Ihre Schulleitung. Nach Ende der Zuordnung sind Funktionalitäten, die im Bezug zu dieser Schule und Rolle stehen, nicht mehr verfügbar.`;

        await headerPage.logout();
        const landingPage: LandingPage = new LandingPage(page);
        await landingPage.buttonAnmelden.click();
        const startView: StartViewPage = await loginPage.login(userInfoLehrer2.username, userInfoLehrer2.password);
        await loginPage.updatePassword();
        await startView.waitForPageLoad();
        currentUserIsLandesadministrator = false;

        await expect(page.getByText(alertText)).toBeVisible();
        await expect(page.getByRole('alert')).toHaveCSS('background-color', colorRed);
      });
    },
  );
});
