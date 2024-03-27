import { type Locator, Page } from '@playwright/test';

export class RolleManagementViewPage{
    readonly page: Page;
    readonly text_h2_RolleAnlegen: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h2_RolleAnlegen = page.getByTestId('layout-card-headline');
    }
}