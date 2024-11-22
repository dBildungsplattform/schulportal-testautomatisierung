import { type Locator, Page } from '@playwright/test';

export class FooterDataTablePage{
    readonly page: Page;
    readonly combobox_AnzahlEintraege: Locator;
    readonly text_AktuelleSeite: Locator;
    readonly text_LetzteSeite: Locator;

    constructor(page){
        this.page = page;

        // Locator for the dropdown to select the number of entries per page
        this.combobox_AnzahlEintraege = page.locator('.v-data-table-footer__items-per-page .v-input')

        // Locator to identify the current page number
        this.text_AktuelleSeite = page.locator('.v-data-table-footer__page-text');

        // Locator to identify the last page
        this.text_LetzteSeite = page.locator('.v-pagination__next button:not(.v-btn--disabled)');     
    }
}