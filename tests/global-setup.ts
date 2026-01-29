import { APIResponse, Browser, BrowserContext, chromium, Page } from '@playwright/test';

import { ApiResponse, OrganisationenApi, OrganisationResponse, OrganisationsTyp } from '../base/api/generated';
import { constructOrganisationApi, getOrganisationId } from '../base/api/organisationApi';
import FromAnywhere from '../pages/FromAnywhere.neu';
import { LandingViewPage } from '../pages/LandingView.neu.page';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';
import { landSH } from '../base/organisation';
import { getRolleId } from '../base/api/rolleApi';
import { landesadminRolle } from '../base/rollen';
import { createPerson, UserInfo } from '../base/api/personApi';
import { generateNachname, generateVorname } from '../base/utils/generateTestdata';
import { workers } from '../playwright.config';
import { Env } from '../base/env';
import { HeaderPage } from '../pages/components/Header.neu.page';

const searchString: string = 'TAuto';

const FRONTEND_URL: string = process.env.FRONTEND_URL ?? '';

/**
 * Global setup – runs ONCE per Playwright run
 */
export default async function globalSetup(): Promise<void> {
  console.log('Global setup started');

  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    baseURL: FRONTEND_URL,
  });

  const page: Page = await context.newPage();

  try {
    // ---------------------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------------------
    console.log('Login');

    {
      const landingPage: LandingViewPage = await FromAnywhere(page).start();
      const loginPage: LoginViewPage = await landingPage.navigateToLogin();
      const startPage: StartViewPage = await loginPage.login(process.env.USER!, process.env.PW!);
      await startPage.waitForPageLoad();
      await startPage.navigateToAdministration();
    }

    // ---------------------------------------------------------------------
    // BOOTSTRAP ADMINS
    // ---------------------------------------------------------------------
    console.log('Bootstrap Admins');
    console.log(`Creating ${workers} admins`);

    const organisationId: string = await getOrganisationId(page, landSH);
    const rolleId: string = await getRolleId(page, landesadminRolle);

    const userInfos: Array<UserInfo> = await Promise.all(
      Array.from({ length: workers }).map(() =>
        createPerson(page, organisationId, rolleId, generateNachname(), generateVorname()),
      ),
    );

    const header: HeaderPage = new HeaderPage(page);
    await header.logout();

    for (const [index, userInfo] of userInfos.entries()) {
      const page: Page = await context.newPage();
      try {
        const landingPage: LandingViewPage = await FromAnywhere(page).start();
        const loginPage: LoginViewPage = await landingPage.navigateToLogin();
        const startPage: StartViewPage = await loginPage.login(userInfo.username, userInfo.password);
        const password: string = await loginPage.updatePassword();
        await startPage.waitForPageLoad();
        Env.setUsername(userInfo.username, index);
        Env.setPassword(password, index);
        const header: HeaderPage = new HeaderPage(page);
        await header.logout();
        await page.close();
        console.log(`Created ${index + 1}/${workers}`);
      } catch (error) {
        await page.screenshot({ path: `error-creating-admin-${index}.png` });
        console.error(`Error creating admin ${index}:`, error);
        throw error;
      } finally {
        await page.close();
      }
    }
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('Global setup completed');
}
