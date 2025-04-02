import { type Locator, Page } from '@playwright/test';

export class CalendarPage{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;  
        this.textH1 = page.getByRole('heading', { name: 'Kalender', exact: true }).locator('span');
    }
}