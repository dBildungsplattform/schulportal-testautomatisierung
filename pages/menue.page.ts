import { type Locator, Page } from '@playwright/test';

export class MenuePage{
    readonly page: Page;
    readonly button_Anmelden: Locator;
    readonly button_Abmelden: Locator;
    readonly button_Startseite: Locator;

    constructor(page){
        this.page = page;  
        this.button_Anmelden = page.getByRole('link', { name: 'Anmelden' });
        this.button_Abmelden = page.getByRole('link', { name: 'Abmelden' });
        this.button_Startseite = page.getByRole('link', { name: 'Home' });
    }
}