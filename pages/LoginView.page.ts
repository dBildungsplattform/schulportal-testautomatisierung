import { expect, type Locator, Page } from '@playwright/test';
import generator from 'generate-password-ts';
import { StartPage } from './StartView.page';

export class LoginPage {
  readonly page: Page;
  readonly titleAnmeldung: Locator;
  readonly titlePasswortFestlegen: Locator;
  readonly titleUsername: Locator;
  readonly input_username: Locator;
  readonly input_password: Locator;
  readonly input_NewPassword: Locator;
  readonly input_ConfirmPW: Locator;
  readonly textInfoLogin: Locator;
  readonly textInfoPWUpdate: Locator;
  readonly inputErrorMessage: Locator;
  readonly text_span_alertBox: Locator;
  readonly button_login: Locator;
  readonly button_submitPWChange: Locator;
  readonly buttonSubmitPWChangeFromProfilView: Locator;
  readonly buttonClosePWChangeDialogFromProfilView: Locator;

  constructor(page) {
    this.page = page;
    this.titleAnmeldung = page.getByTestId('login-page-title'); 
    this.titlePasswortFestlegen = page.getByTestId('update-password-title');
    this.titleUsername = page.locator('#kc-attempted-username');
    this.input_username = page.getByTestId('username-input');
    this.input_password = page.getByTestId('password-input');
    this.input_NewPassword = page.getByTestId('new-password-input');
    this.input_ConfirmPW = page.getByTestId('new-password-confirm-input');
    this.textInfoLogin = page.getByTestId('login-prompt-text');
    this.textInfoPWUpdate = page.locator('.password-update-prompt'); 
    this.inputErrorMessage = page.locator('#input-error');
    this.text_span_alertBox = page.locator('.pf-c-alert__title');
    this.button_login = page.getByTestId('login-button');
    this.button_submitPWChange = page.getByTestId('set-password-button');
    this.buttonSubmitPWChangeFromProfilView = page.getByRole('button', { name: 'Passwort ändern' });
    this.buttonClosePWChangeDialogFromProfilView = page.getByTestId('close-password-changed-dialog-button');
  }

  async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string,
  ): Promise<StartPage> {
    await expect(this.titleAnmeldung).toHaveText('Anmeldung');
    await expect(this.textInfoLogin).toHaveText('Bitte geben Sie Ihre persönlichen Zugangsdaten ein.');
    await this.input_username.click();
    await this.input_username.fill(username);
    await this.input_password.click();
    await this.input_password.fill(password);
    await this.button_login.click();
    return new StartPage(this.page);
  }

  async loginCurrentUser(
    username: string,
    password: string,
  ) {
    await expect(this.titleUsername).toHaveText(username);
    await expect(this.textInfoLogin).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
    await this.input_password.click();
    await this.input_password.fill(password);
    await this.button_login.click();
  }

  async updatePW(isEntryFromProfileView?: boolean) {
    const newPassword = generator.generate({ length: 8, numbers: true }) + '1Aa!';
    await expect(this.titlePasswortFestlegen).toHaveText('Passwort festlegen');
    await expect(this.textInfoPWUpdate).toHaveText('Bitte legen Sie ein neues, selbstgewähltes Passwort fest.');
    await this.input_NewPassword.click();
    await this.input_NewPassword.fill(newPassword);
    await this.input_ConfirmPW.click();
    await this.input_ConfirmPW.fill(newPassword);

    if(!isEntryFromProfileView) {
      await this.button_submitPWChange.click();
    } else {
      await this.buttonSubmitPWChangeFromProfilView.click();
      await this.buttonClosePWChangeDialogFromProfilView.click();
    }
    return newPassword;
  }
}
