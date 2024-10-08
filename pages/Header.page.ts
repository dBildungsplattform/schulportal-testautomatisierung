import { type Locator, Page } from '@playwright/test';

export class HeaderPage{
    readonly page: Page;
    readonly button_login: Locator;
    readonly button_logout: Locator;
    readonly button_profil: Locator;
   
    constructor(page){
        this.page = page;  
        this.button_login = page.getByTestId('nav-login-button');
        this.button_logout = page.getByTestId('nav-logout-button');
        this.button_profil = page.getByTestId('nav-profile-button');
    }
}