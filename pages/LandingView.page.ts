import {expect, type Locator} from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || "";

export class LandingPage {
    readonly text_Willkommen: Locator;
    readonly button_Anmelden: Locator;

    constructor(private readonly page, private readonly url = FRONTEND_URL) {
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

    async klasseAnlegen() {
        this.page.goto(FRONTEND_URL + 'admin/klassen/new');
    }
}