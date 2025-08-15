import { expect, Page } from '@playwright/test';
import generator from 'generate-password-ts';
import { StartViewPage } from './StartView.neu.page';

export class LoginViewPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('login-page-title').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
  }

  private generateSecurePassword(): string {
    return generator.generate({ length: 8, numbers: true }) + '1Aa!';
  }

  public async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string
  ): Promise<StartViewPage> {
    const usernameInput = this.page.getByTestId('username-input');
    const passwordInput = this.page.getByTestId('password-input');
    const loginButton = this.page.getByTestId('login-button');

    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
    await expect(this.page.getByTestId('login-prompt-text')).toHaveText('Bitte geben Sie Ihre persönlichen Zugangsdaten ein.');
    
    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(username);
    
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    return new StartViewPage(this.page);
  }

  public async updatePassword(): Promise<string> {
    const newPassword: string = this.generateSecurePassword();
    const newPasswordInput = this.page.getByTestId('new-password-input');
    const newPasswordConfirmInput = this.page.getByTestId('new-password-confirm-input');
    const setPasswordButton = this.page.getByTestId('update-password-button');

    await expect(this.page.getByTestId('update-password-title')).toHaveText('Passwort festlegen');
    await expect(this.page.locator('.password-update-prompt')).toHaveText('Bitte legen Sie ein neues, selbstgewähltes Passwort fest.');

    await newPasswordInput.waitFor({ state: 'visible' });
    await newPasswordInput.fill(newPassword);

    await newPasswordConfirmInput.waitFor({ state: 'visible' });
    await newPasswordConfirmInput.fill(newPassword);

    await setPasswordButton.waitFor({ state: 'visible' });
    await setPasswordButton.click();
    return newPassword;
  }

  /* assertions */
}
