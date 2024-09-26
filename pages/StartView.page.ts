import { type Locator, Page } from '@playwright/test';

export class StartPage{
    readonly page: Page;
    readonly text_h2_Ueberschrift: Locator;
    readonly card_item_email: Locator;
    readonly card_item_calendar: Locator;
    readonly card_item_directory: Locator;
    readonly card_item_itslearning: Locator;
    readonly card_item_schulportal_administration: Locator;

    constructor(page){
        this.page = page;  
        this.text_h2_Ueberschrift = page.getByTestId('all-service-provider-title');
        this.card_item_email = page.getByText('E-Mail', { exact: true });
        this.card_item_calendar = page.getByText('Kalender', { exact: true });
        this.card_item_directory = page.getByText('Adressbuch', { exact: true });
        this.card_item_itslearning = page.getByText('itslearning', { exact: true });
        this.card_item_schulportal_administration = page.getByText('Schulportal-Administration', { exact: true });
    }
}