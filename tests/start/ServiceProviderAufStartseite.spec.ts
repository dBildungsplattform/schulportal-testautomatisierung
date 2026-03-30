import test, { PlaywrightTestArgs } from '@playwright/test';

import { RollenArt } from '../../base/api/generated';
import { createKlasse, createSchule } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import {
  adressbuch,
  anleitungen,
  email,
  helpdeskKontaktieren,
  itslearning,
  kalender,
  opSH,
  psychosozialesBeratungsangebot,
  schoolSH,
  schulportaladmin,
  schulrechtAZ,
  webUntis,
} from '../../base/sp';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  generateKlassenname,
  generateNachname,
  generateRolleName,
  generateSchulname,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { testFixtures } from './ServiceProviderAufStartseite.data';
import { DEV, STAGE } from '../../base/tags';

const allProviderNames: string[] = [
  email,
  itslearning,
  kalender,
  adressbuch,
  schulportaladmin,
  opSH,
  schoolSH,
  webUntis,
  anleitungen,
  helpdeskKontaktieren,
  psychosozialesBeratungsangebot,
  schulrechtAZ,
];

test.describe('ServiceProvider auf Startseite', () => {
  for (const { rollenArt, serviceProviderNames } of testFixtures) {
    test(
      `Als ${rollenArt} prüfen, dass die richtigen ServiceProvider sichtbar sind`,
      { tag: [STAGE, DEV] },
      async ({ page }: PlaywrightTestArgs) => {
        const startPage: StartViewPage = await test.step('Daten anlegen', async () => {
          const personManagementViewPage: PersonManagementViewPage = await loginAndNavigateToAdministration(page);
          const schulName: string = generateSchulname();
          const schuleId: string = await createSchule(page, schulName);
          const klasseId: string | null =
            rollenArt === RollenArt.Lern ? await createKlasse(page, schuleId, generateKlassenname()) : null;

          const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
            page,
            schulName,
            rollenArt,
            generateNachname(),
            generateVorname(),
            await Promise.all(serviceProviderNames.map((name: string) => getServiceProviderId(page, name))),
            generateRolleName(),
            undefined,
            klasseId ? klasseId : undefined,
          );
          const landingViewPage: LandingViewPage = await personManagementViewPage.getHeader().logout();
          const loginPage: LoginViewPage = await landingViewPage.navigateToLogin();
          return await loginPage.loginNewUserWithPasswordChange(userInfo.username, userInfo.password);
        });
        await test.step('Sichtbarkeit der ServiceProvider prüfen', async () => {
          await startPage.waitForPageLoad();
          await startPage.assertServiceProvidersAreVisible(serviceProviderNames);
          await startPage.assertServiceProvidersAreHidden(
            allProviderNames.filter((name: string) => !serviceProviderNames.includes(name)),
          );
        });
      },
    );
  }
});
