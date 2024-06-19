import { type Locator, Page } from '@playwright/test';

export class KlasseManagementViewPage{
    readonly page: Page;
    readonly text_h1_Administrationsbereich: Locator;
    readonly text_h2_Klassenverwaltung: Locator;
    readonly combobox_Filter_Schule: Locator;
    readonly combobox_Filter_Klasse: Locator;
    readonly table_header_Dienstellennummer: Locator;
    readonly table_header_Klassenname: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h1_Administrationsbereich = page.getByTestId('admin-headline');
        this.text_h2_Klassenverwaltung = page.getByTestId('layout-card-headline');
        this.combobox_Filter_Schule = page.getByPlaceholder('Schule');
        this.combobox_Filter_Klasse = page.getByPlaceholder('Klasse');
        this.table_header_Dienstellennummer = page.getByText('Dienststellennummer');
        this.table_header_Klassenname = page.getByTestId('klasse-table').getByText('Klasse');
    }
}