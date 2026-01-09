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

/**
 * Prepares a test user with the specified system rights and logs them into the application.
 *
 * Steps performed by this function:
 * 1. Creates a new user with a role and person context for the main test school.
 * 2. Assigns the provided system rights (`permissions`) to the user's role.
 * 3. Adds a second school to the user's person context for multi-school scenarios.
 * 4. Logs out any existing session.
 * 5. Logs in with the newly created user and completes the mandatory password change.
 * 6. Navigates to the Administration view to ensure the user session is ready for tests.
 *
 * @param page - The Playwright `Page` object representing the browser page.
 * @param permissions - An array of `RollenSystemRecht` system rights to assign to the user.
 *
 * @example
 * ```ts
 * await prepareAndLoginUserWithPermissions(page, [
 *   RollenSystemRecht.PERSONEN_VERWALTEN,
 *   RollenSystemRecht.KLASSEN_VERWALTEN,
 * ]);
 * ```
 */
export async function prepareAndLoginUserWithPermissions(
  page: Page,
  permissions: RollenSystemRecht[],
): Promise<void> {
  // Get the service provider ID for Schulportal Administration
  const idSPs: string[] = [
    await getServiceProviderId(page, 'Schulportal-Administration'),
  ];

  // Create a new user with role and person context
  const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
    page,
    testschuleName,
    'LEIT',
    generateNachname(),
    generateVorname(),
    idSPs,
    generateRolleName(),
  );

  // Assign each system right to the newly created role
  for (const permission of permissions) {
    await addSystemrechtToRolle(page, userInfo.rolleId, permission);
  }

  // Add a second school to the user's person context
  const primarySchuleId: string = await getOrganisationId(page, testschuleName);
  const secondSchuleId: string = await getOrganisationId(page, testschule665Name);
  await addSecondOrganisationToPerson(page, userInfo.personId, primarySchuleId, secondSchuleId, userInfo.rolleId);

  // Logout any existing session
  const header: HeaderPage = new HeaderPage(page);
  await header.logout();

  // Navigate to login page and login with the newly created user
  const landingPage: LandingViewPage = new LandingViewPage(page);
  const loginPage: LoginViewPage = await landingPage.navigateToLogin();
  const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
    userInfo.username,
    userInfo.password,
  );

  // Wait for the start page to load and go to administration
  await startPage.waitForPageLoad();
  await startPage.goToAdministration();
}
