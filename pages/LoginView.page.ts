import { expect, type Locator, Page } from '@playwright/test';
import generator from 'generate-password-ts';
import { StartPage } from './StartView.page';

export class LoginPage {
  readonly page: Page;
  readonly titleAnmeldung: Locator;
  readonly titlePasswortFestlegen: Locator;
  readonly titleUsername: Locator;
  readonly inputUsername: Locator;
  readonly inputPassword: Locator;
  readonly inputNewPassword: Locator;
  readonly inputConfirmPW: Locator;
  readonly textInfoLogin: Locator;
  readonly textInfoPWUpdate: Locator;
  readonly inputErrorMessage: Locator;
  readonly textSpanAlertBox: Locator;
  readonly buttonLogin: Locator;
  readonly buttonSubmitPWChange: Locator;
  readonly buttonSubmitPWChangeFromProfilView: Locator;
  readonly buttonClosePWChangeDialogFromProfilView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleAnmeldung = page.getByTestId('login-page-title');
    this.titlePasswortFestlegen = page.getByTestId('update-password-title');
    this.titleUsername = page.locator('#kc-attempted-username');
    this.inputUsername = page.getByTestId('username-input');
    this.inputPassword = page.getByTestId('password-input');
    this.inputNewPassword = page.getByTestId('new-password-input');
    this.inputConfirmPW = page.getByTestId('new-password-confirm-input');
    this.textInfoLogin = page.getByTestId('login-prompt-text');
    this.textInfoPWUpdate = page.locator('.password-update-prompt');
    this.inputErrorMessage = page.locator('#input-error');
    this.textSpanAlertBox = page.locator('.pf-c-alert__title');
    this.buttonLogin = page.getByTestId('login-button');
    this.buttonSubmitPWChange = page.getByTestId('set-password-button');
    this.buttonSubmitPWChangeFromProfilView = page.getByRole('button', { name: 'Passwort ändern' });
    this.buttonClosePWChangeDialogFromProfilView = page.getByTestId('close-password-changed-dialog-button');
  }

  async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string
  ): Promise<StartPage> {
    await expect(this.titleAnmeldung).toHaveText('Anmeldung');
    await expect(this.textInfoLogin).toHaveText('Bitte geben Sie Ihre persönlichen Zugangsdaten ein.');
    await this.inputUsername.click();
    await this.inputUsername.fill(username);
    await this.inputPassword.click();
    await this.inputPassword.fill(password);
    await this.buttonLogin.click();
    return new StartPage(this.page);
  }

  async loginCurrentUser(username: string, password: string): Promise<void> {
    await expect(this.titleUsername).toHaveText(username);
    await expect(this.textInfoLogin).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
    await this.inputPassword.click();
    await this.inputPassword.fill(password);
    await this.buttonLogin.click();
  }

  async updatePW(isEntryFromProfileView?: boolean): Promise<string> {
    const newPassword:string = generator.generate({ length: 8, numbers: true }) + '1Aa!';
    await expect(this.titlePasswortFestlegen).toHaveText('Passwort festlegen');
    await expect(this.textInfoPWUpdate).toHaveText('Bitte legen Sie ein neues, selbstgewähltes Passwort fest.');
    await this.inputNewPassword.click();
    await this.inputNewPassword.fill(newPassword);
    await this.inputConfirmPW.click();
    await this.inputConfirmPW.fill(newPassword);

    if (!isEntryFromProfileView) {
      await this.buttonSubmitPWChange.click();
    } else {
      await this.buttonSubmitPWChangeFromProfilView.click();
      await this.buttonClosePWChangeDialogFromProfilView.click();
    }
    return newPassword;
  }
}
