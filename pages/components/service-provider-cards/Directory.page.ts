import { type Locator, Page } from '@playwright/test';

export class DirectoryPage{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;
        // TODO: this looks bad, but it works
        this.textH1 = page.getByRole('heading', { name: 'Adressbuch', exact: true }).locator('span');
    }
}