import { type Locator, Page } from '@playwright/test';

export class StartPage{
    readonly page: Page;
    readonly text_h2_Ueberschrift: Locator;

    constructor(page){
        this.page = page;  
        this.text_h2_Ueberschrift = page.getByRole('heading', { name: 'Alle Angebote' });  
    }
}