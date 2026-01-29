import { type Page } from '@playwright/test';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { freshLoginPage } from './api/personApi';
import { StartViewPage } from '../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.neu.page';
import { Env } from './env';

export async function gotoTargetURL(page: Page, target: string): Promise<void> {
  await page.goto(target);
}

export async function login(
  page: Page,
  username: string | undefined = Env.getUsername(process.env['TEST_PARALLEL_INDEX']),
  password: string | undefined = Env.getPassword(process.env['TEST_PARALLEL_INDEX']),
): Promise<StartViewPage> {
  const loginPage: LoginViewPage = await freshLoginPage(page);
  if (!username) throw new Error('No username provided for login');
  if (!password) throw new Error('No password provided for login');
  const startPage = await loginPage.login(username, password);
  return startPage.waitForPageLoad();
}

export async function loginAndNavigateToAdministration(
  page: Page,
  username: string | undefined = Env.getUsername(process.env['TEST_PARALLEL_INDEX']),
  password: string | undefined = Env.getPassword(process.env['TEST_PARALLEL_INDEX']),
): Promise<PersonManagementViewPage> {
  const startPage: StartViewPage = await login(page, username, password);
  const personManagementPage: PersonManagementViewPage = await startPage.navigateToAdministration();
  return personManagementPage.waitForPageLoad();
}
