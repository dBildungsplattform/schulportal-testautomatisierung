import { type Locator, Page } from '@playwright/test';

export class ItsLearningPage{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;
        // TODO: this looks bad, but it works
        this.textH1 = page.getByRole('heading', { name: 'Staging Umgebung Schleswig-Holstein', exact: true }).locator('span');
    }
}