import { type Locator, Page } from '@playwright/test';

export class HeaderPage{
    readonly page: Page;
    readonly button_logout: Locator;
   
    constructor(page){
        this.page = page;  
        this.button_logout = page.getByTestId('nav-logout-button');
    }
}