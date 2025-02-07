import { type Locator, Page, expect } from '@playwright/test';
import { LandingPage } from "./LandingView.page";
import FromAnywhere from '../pages/FromAnywhere';

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

    async logout(): Promise<LandingPage> {
        // Wenn man auf den Abmelden-Button klickt, laufen häufig noch diverse requests. Deshalb brauchen wir hier eine kurze Verzögerung bzw. einen Sprung auf die Startseite
        // Wird mit SPSH-1809 überarbeitet
        await FromAnywhere(this.page).start();
        await this.page.waitForResponse(resp => resp.url().includes('/api/provider') && resp.status() === 200);
        
        await this.button_logout.click();
        const landingPage: LandingPage = new LandingPage(this.page);
        await expect(landingPage.text_Willkommen).toBeVisible();
        return new LandingPage(this.page);
    }
}