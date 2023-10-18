import { test, expect, type Locator, type Page } from '@playwright/test';

export class LoginPage{
    readonly page: Page;
    readonly button_StartAnmelden: Locator;
    readonly text_h1_UeberschriftLoginSeite: Locator;
    readonly input_username: Locator;
    readonly input_password: Locator;
    readonly button_login: Locator;
    readonly text_h1_UeberschriftStartseite: Locator;

    constructor(page){
        this.page = page;  
        this.button_StartAnmelden = page.getByRole('link', { name: 'Anmelden' });
        this.text_h1_UeberschriftLoginSeite = page.getByRole('heading', { name: 'This is a login page' })
        this.input_username = page.locator("#input-1");
        this.input_password = page.locator("#input-3");
        this.button_login = page.getByTestId('login-button');
        this.text_h1_UeberschriftStartseite = page.getByRole('heading', { name: 'This is gonna be the home page' });
    }

    async login(username, password, url){
        await this.page.goto(url);
        await this.button_StartAnmelden.click();
        await expect(this.text_h1_UeberschriftLoginSeite).toBeVisible();
        await this.input_username.click();
        await this.input_username.fill(username);
        await this.input_password.click();
        await this.input_password.fill(password);
        await this.button_login.click();
    }
}