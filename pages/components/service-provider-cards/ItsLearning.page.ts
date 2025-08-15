import { type Locator, Page } from '@playwright/test';

export class ItsLearningPage{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;  
        this.textH1 = page.getByRole('heading', { name: 'Staging Umgebung Schleswig-Holstein' });
    }
}