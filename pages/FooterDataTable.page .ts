import { type Locator, Page } from '@playwright/test';

export class FooterDataTablePage{
    readonly page: Page;
    readonly combobox_AnzahlEintraege: Locator;

    constructor(page){
        this.page = page;  
        this.combobox_AnzahlEintraege = page.locator('.v-data-table-footer__items-per-page .v-input');
    }
}