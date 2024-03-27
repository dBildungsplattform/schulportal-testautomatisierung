import { expect, type Locator, Page } from '@playwright/test';
import generator from 'generate-password-ts';

export class LoginPage{
    readonly page: Page;
    readonly input_username: Locator;
    readonly input_password: Locator;
    readonly input_NewPassword: Locator;
    readonly input_ConfirmPW: Locator;
    readonly button_login: Locator;
    readonly button_submitPWChange: Locator;
    readonly text_h1: Locator;
    readonly text_h1_updatePW: Locator;
    readonly text_span_inputerror: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByTestId('login-page-title');
        this.text_h1_updatePW = page.getByTestId('login-page-title')
        this.input_username = page.getByTestId('username-input');
        this.input_password = page.getByTestId('password-input')
        this.input_NewPassword = page.getByLabel('Neues Passwort');
        this.input_ConfirmPW = page.getByLabel('Passwort bestätigen');
        this.button_login = page.getByTestId('login-button');
        this.button_submitPWChange = page.getByRole('button', { name: 'Absenden' });
        this.text_span_inputerror = page.getByText('Ungültiger Benutzername oder Passwort');
    }

    async login(username, password){
        await expect(this.text_h1).toBeVisible();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }

    async UpdatePW(){
        let new_Password = '';
        new_Password = generator.generate({ length: 10, numbers: true });
        await expect(this.text_h1_updatePW).toBeVisible();
        await this.input_NewPassword.click();
        await this.input_NewPassword.fill(new_Password);
        await this.input_ConfirmPW.click();
        await this.input_ConfirmPW.fill(new_Password);
        await this.button_submitPWChange.click();
    }
}