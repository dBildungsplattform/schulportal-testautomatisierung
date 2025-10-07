import { type Locator, Page } from '@playwright/test';

export class Email{
    readonly page: Page;
    readonly textH1: Locator;

    constructor(page: Page){
        this.page = page;
        this.textH1 = page.getByTestId('card-title').getByText('E-Mail', { exact: true });
    }
}