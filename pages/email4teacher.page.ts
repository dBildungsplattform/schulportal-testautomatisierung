import { type Locator, Page } from '@playwright/test';

export class Email4TeacherPage{
    readonly page: Page;
    readonly text_h1: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByRole('heading', { name: 'E-Mail', exact: true }).locator('span');
    }
}