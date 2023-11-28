import { type Locator, type Page } from '@playwright/test';

export class MenuePage{
    readonly page: Page;
    readonly button_Anmelden: Locator;
    readonly button_Abmelden: Locator;

    constructor(page){
        this.page = page;  
        this.button_Anmelden = page.getByRole('button', { name: 'Anmelden' });
        this.button_Abmelden = page.getByRole('button', { name: 'Abmelden' });
    }
}