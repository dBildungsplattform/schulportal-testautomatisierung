import { type Locator, Page } from '@playwright/test';

export class StartPage{
    readonly page: Page;
    readonly text_h2_Ueberschrift: Locator;
    readonly card_item_email: Locator;
    readonly card_item_itslearning: Locator;

    constructor(page){
        this.page = page;  
        this.text_h2_Ueberschrift = page.getByRole('heading', { name: 'Alle Angebote' });  
        this.card_item_email = page.getByTestId('provider-card-1');
        this.card_item_itslearning = page.getByTestId('provider-card-2');
    }
}