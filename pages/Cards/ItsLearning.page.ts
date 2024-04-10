import { type Locator, Page } from '@playwright/test';

export class ItsLearningPage{
    readonly page: Page;
    readonly text_h1: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1 = page.getByRole('heading', { name: 'QS Umgebung für SH' });
    }
}