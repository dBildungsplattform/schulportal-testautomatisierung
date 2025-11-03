import { expect, type Locator, Page } from '@playwright/test';
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
    const usernameInput: Locator = this.page.getByTestId('username-input');
    const passwordInput: Locator = this.page.getByTestId('password-input');
    const loginButton: Locator = this.page.getByTestId('login-button');

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
    const newPasswordInput: Locator = this.page.getByTestId('new-password-input');
    const newPasswordConfirmInput: Locator = this.page.getByTestId('new-password-confirm-input');
    const setPasswordButton: Locator = this.page.getByRole('button', { name: 'Passwort ändern' });

    await expect(this.page.getByTestId('update-password-title')).toHaveText('Passwort festlegen');
    await expect(this.page.getByTestId('password-update-prompt')).toHaveText('Bitte legen Sie ein neues, selbstgewähltes Passwort fest.');

    await newPasswordInput.waitFor({ state: 'visible' });
    await newPasswordInput.fill(newPassword);

    await newPasswordConfirmInput.waitFor({ state: 'visible' });
    await newPasswordConfirmInput.fill(newPassword);

    await setPasswordButton.waitFor({ state: 'visible' });
    await setPasswordButton.click();
    return newPassword;
  }

  /* assertions */
  public async loginFailedWithWrongCredentials(): Promise<void> {
    const inputErrorSpan: Locator = this.page.getByTestId('input-error-message');

    await expect(inputErrorSpan).toBeVisible();
    await expect(inputErrorSpan).toHaveText('Ungültiger Benutzername oder Passwort.');
  }

  public async loginFailedWithLockedUser(): Promise<void> {
    const loginErrorSpan: Locator = this.page.getByTestId('login-error-message');

    await expect(loginErrorSpan).toBeVisible();
    await expect(loginErrorSpan).toHaveText('Ihr Benutzerkonto ist gesperrt. Bitte wenden Sie sich an Ihre schulischen Administratorinnen und Administratoren.');
  }
}
