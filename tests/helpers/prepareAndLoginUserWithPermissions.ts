import { Page } from "@playwright/test";
import { addSecondOrganisationToPerson, createRolleAndPersonWithPersonenkontext, UserInfo } from "../../base/api/personApi";
import { addSystemrechtToRolle } from "../../base/api/rolleApi";
import { getServiceProviderId } from "../../base/api/serviceProviderApi";
import { testschule665Name, testschuleName } from "../../base/organisation";
import { generateNachname, generateVorname, generateRolleName } from "../../base/utils/generateTestdata";
import { LoginViewPage } from "../../pages/LoginView.neu.page";
import { StartViewPage } from "../../pages/StartView.neu.page";
import { RollenSystemRecht } from "../../base/api/generated/models/RollenSystemRecht";
import { HeaderPage } from "../../pages/components/Header.neu.page";
import { LandingViewPage } from "../../pages/LandingView.neu.page";
import { getOrganisationId } from "../../base/api/organisationApi";

export async function prepareAndLoginUserWithPermissions(
  page: Page,
  permissions: RollenSystemRecht[],
): Promise<void> {
  const idSPs: string[] = [
    await getServiceProviderId(page, 'Schulportal-Administration'),
  ];

  const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
    page,
    testschuleName,
    'LEIT',
    generateNachname(),
    generateVorname(),
    idSPs,
    generateRolleName(),
  );

  for (const permission of permissions) {
    await addSystemrechtToRolle(page, userInfo.rolleId, permission);
  }

  const primarySchuleId: string = await getOrganisationId(page, testschuleName);
  const secondSchuleId: string = await getOrganisationId(page, testschule665Name);
  await addSecondOrganisationToPerson(page, userInfo.personId, primarySchuleId, secondSchuleId, userInfo.rolleId);

  const header: HeaderPage = new HeaderPage(page);
  await header.logout();
  const landingPage: LandingViewPage = new LandingViewPage(page);
  const loginPage: LoginViewPage = await landingPage.navigateToLogin();

  const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
    userInfo.username,
    userInfo.password,
  );

  await startPage.waitForPageLoad();
  await startPage.goToAdministration();
}
