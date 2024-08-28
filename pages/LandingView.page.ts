import {expect, type Locator, Page} from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || "";

export class LandingPage{
    readonly page: Page;
    readonly url: string;
    readonly text_Willkommen: Locator;
    readonly button_Anmelden: Locator;

    constructor(page, url = FRONTEND_URL){
        this.page = page;
        this.url = url;
        this.text_Willkommen = page.getByTestId('landing-headline');
        this.button_Anmelden = page.getByTestId('login-button');
    }

    async goto() {
        await this.page.goto(this.url);
        await expect(this.text_Willkommen).toBeVisible();
    }

    async login() {
        this.goto();
        this.button_Anmelden.click();
    }
}