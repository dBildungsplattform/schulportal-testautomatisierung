import { test, expect, type Locator, type Page } from '@playwright/test';

export class LandingPage{
    readonly page: Page;
    readonly text_h1_UeberschriftStartseite: Locator;

    constructor(page){
        this.page = page;  
        this.text_h1_UeberschriftStartseite = page.getByRole('heading', { name: 'This is gonna be a landing page' });
    }
}