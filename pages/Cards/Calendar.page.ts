import { type Locator, Page } from '@playwright/test';

export class CalendarPage{
    readonly page: Page;
    readonly text_h1: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByRole('heading', { name: 'Kalender', exact: true }).locator('span');
    }
}