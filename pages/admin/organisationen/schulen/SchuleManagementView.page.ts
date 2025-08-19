import { type Locator, Page } from '@playwright/test';

export class SchuleManagementViewPage{
    readonly page: Page;
    readonly textH1Administrationsbereich: Locator;
    readonly textH2Schulverwaltung: Locator;
    readonly tableHeaderDienststellennummer: Locator;
    readonly tableHeaderSchulname: Locator;
   
    constructor(page: Page){
        this.page = page;  
        this.textH1Administrationsbereich = page.getByTestId('admin-headline');
        this.textH2Schulverwaltung = page.getByTestId('layout-card-headline');
        this.tableHeaderDienststellennummer = page.getByText('Dienststellennummer');
        this.tableHeaderSchulname = page.getByText('Schulname');
    }
}