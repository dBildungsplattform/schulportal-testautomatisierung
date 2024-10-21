import { type Locator, Page, expect } from '@playwright/test';
import { LandingPage } from "./LandingView.page";

export class HeaderPage{
    readonly page: Page;
    readonly button_login: Locator;
    readonly button_logout: Locator;
    readonly button_profil: Locator;
    readonly icon_myProfil: Locator;
    readonly icon_logout: Locator;
   
    constructor(page){
        this.page = page;
        this.button_login = page.getByTestId('nav-login-button');
        this.button_logout = page.getByTestId('nav-logout-button');
        this.button_profil = page.getByTestId('nav-profile-button');
        this.icon_myProfil = page.locator('.mdi-account-outline');
        this.icon_logout = page.locator('.mdi-logout');
    }

    async logout() {
        const landingPage = new LandingPage(this.page);
        await this.button_logout.click();
        await expect(landingPage.text_Willkommen).toBeVisible();
    }
}