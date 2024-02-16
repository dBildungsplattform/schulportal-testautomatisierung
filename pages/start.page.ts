import { type Locator, Page } from '@playwright/test';

export class StartPage{
    readonly page: Page;
    readonly text_h2_Ueberschrift: Locator;
    readonly card_item_email: Locator;
    readonly card_item_itslearning: Locator;
    readonly card_item_schulportal_administration: Locator;

    constructor(page){
        this.page = page;  
        this.text_h2_Ueberschrift = page.getByRole('heading', { name: 'Alle Angebote' });  
        this.card_item_email = page.getByTestId('provider-card-8f448f82-0be3-4d82-9cb1-2e67f277796f');
        this.card_item_itslearning = page.getByTestId('provider-card-ecc794a3-f94f-40f6-bef6-bd4808cf64d4');
        this.card_item_schulportal_administration = page.getByTestId('provider-card-admin');
    }
}