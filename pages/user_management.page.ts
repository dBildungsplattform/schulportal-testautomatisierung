import { type Locator, Page } from '@playwright/test';

export class UserManagementPage{
    readonly page: Page;
    readonly text_h2: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h2 = page.getByRole('heading', { name: "Benutzerverwaltung" });
    }
}