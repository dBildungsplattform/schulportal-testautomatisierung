import { test, expect, type Locator, type Page } from '@playwright/test';
import { MenuePage } from '../pages/menue';

export class LoginPage{
    readonly page: Page;
    
    readonly text_h1_UeberschriftLoginSeite: Locator;
    readonly input_username: Locator;
    readonly input_password: Locator;
    readonly button_login: Locator;
    readonly button_logoff: Locator;
    readonly text_h1_login: Locator;
    // readonly text_h1_UeberschriftStartseite: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1_login = page.getByRole('heading', { name: 'Sign in to your account' });
        this.input_username = page.getByLabel('Username or email');
        this.input_password = page.getByLabel('Password');
        this.button_login = page.getByRole('button', { name: 'Sign In' })
    }

    async login(username, password){
        await expect(this.text_h1_login).toBeVisible();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }
}