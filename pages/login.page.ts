import { expect, type Locator, Page } from '@playwright/test';

export class LoginPage{
    readonly page: Page;
    readonly input_username: Locator;
    readonly input_password: Locator;
    readonly button_login: Locator;
    readonly button_logoff: Locator;
    readonly text_h1: Locator;
    readonly text_span_inputerror: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByRole('heading', { name: 'Sign in to your account' });
        this.input_username = page.getByLabel('Username or email');
        this.input_password = page.getByLabel('Password');
        this.button_login = page.getByRole('button', { name: 'Sign In' });
        this.text_span_inputerror = page.getByText('Invalid username or password.');
    }

    async login(username, password){
        await expect(this.text_h1).toBeVisible();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }
}