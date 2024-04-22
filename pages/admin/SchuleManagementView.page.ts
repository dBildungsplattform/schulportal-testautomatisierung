import { type Locator, Page } from '@playwright/test';

export class SchuleManagementViewPage{
    readonly page: Page;
    readonly text_h1_Administrationsbereich: Locator;
    readonly text_h2_Schulverwaltung: Locator;
    readonly table_header_Dienstellennummer: Locator;
    readonly table_header_Schulname: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h1_Administrationsbereich = page.getByTestId('admin-headline');
        this.text_h2_Schulverwaltung = page.getByTestId('layout-card-headline');
        this.table_header_Dienstellennummer = page.getByText('Dienststellennummer');
        this.table_header_Schulname = page.getByText('Schulname');
    }
}