import { type Locator, Page } from '@playwright/test';

export class PersonManagementViewPage{
    readonly page: Page;
    readonly text_h2_Benutzerverwaltung: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h2_Benutzerverwaltung = page.getByTestId('layout-card-headline');
    }
}