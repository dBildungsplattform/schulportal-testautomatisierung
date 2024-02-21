import { type Locator, Page } from '@playwright/test';

export class LandingPage{
    readonly page: Page;
    readonly text_Willkommen: Locator;
    readonly button_Anmelden: Locator;

    constructor(page){
        this.page = page;  
        this.text_Willkommen = page.getByTestId('landing-headline');
        this.button_Anmelden = page.getByTestId('login-button');
    }
}