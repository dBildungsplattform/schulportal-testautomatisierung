import { type Locator, Page } from '@playwright/test';

export class DirectoryPage{
    readonly page: Page;
    readonly text_h1: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByRole('heading', { name: 'Adressbuch', exact: true }).locator('span');
    }
}