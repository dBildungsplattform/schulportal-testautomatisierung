import { type Page } from '@playwright/test';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { freshLoginPage } from './api/personApi';
import { StartViewPage } from '../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.neu.page';

export async function gotoTargetURL(page: Page, target: string): Promise<void> {
  await page.goto(target);
}

export async function login(page: Page, username: string = process.env.USER, password: string = process.env.PW): Promise<StartViewPage> {
  const loginPage: LoginViewPage = await freshLoginPage(page);
  const startPage = await loginPage.login(username, password);
  return startPage.waitForPageLoad();
}

export async function loginAndNavigateToAdministration(page: Page, username: string = process.env.USER, password: string = process.env.PW): Promise<PersonManagementViewPage> {
  const startPage: StartViewPage = await login(page, username, password);
  const personManagementPage: PersonManagementViewPage = await startPage.navigateToAdministration();
  return personManagementPage.waitForPageLoad();
}
