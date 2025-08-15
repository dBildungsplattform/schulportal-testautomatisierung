import { type Locator, Page } from '@playwright/test';

export class Email4TeacherPage{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;  
        this.textH1 = page.getByRole('heading', { name: 'E-Mail', exact: true }).locator('span');
    }
}