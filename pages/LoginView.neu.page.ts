import { expect, Page } from '@playwright/test';
import generator from 'generate-password-ts';
import { StartViewPage } from './StartView.neu.page';

export class LoginViewPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('login-page-title').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
  }

  async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string
  ): Promise<StartViewPage> {
    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
    await expect(this.page.getByTestId('login-prompt-text')).toHaveText('Bitte geben Sie Ihre persönlichen Zugangsdaten ein.');
    await this.page.getByTestId('username-input').fill(username);
    await this.page.getByTestId('password-input').fill(password);
    await this.page.getByTestId('login-button').click();
    return new StartViewPage(this.page);
  }

  async updatePassword(): Promise<string> {
    const newPassword: string = generator.generate({ length: 8, numbers: true }) + '1Aa!';
    await expect(this.page.getByTestId('update-password-title')).toHaveText('Passwort festlegen');
    await expect(this.page.locator('.password-update-prompt')).toHaveText('Bitte legen Sie ein neues, selbstgewähltes Passwort fest.');
    await this.page.getByTestId('new-password-input').fill(newPassword);
    await this.page.getByTestId('new-password-confirm-input').fill(newPassword);
    await this.page.getByTestId('set-password-button').click();
    return newPassword;
  }

  /* assertions */
}
