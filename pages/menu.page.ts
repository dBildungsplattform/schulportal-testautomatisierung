import { type Locator, Page } from '@playwright/test';

export class MenuPage{
    readonly page: Page;
    readonly header_label_Navigation: Locator;
    readonly button_BackStartpage: Locator;
    readonly label_Benutzerverwaltung: Locator;
    readonly menueItem_AlleBenutzerAnzeigen: Locator;
    readonly menueItem_BenutzerAnlegen: Locator;
    readonly label_Klassenverwaltung: Locator;
    readonly label_Rollenverwaltung: Locator;
    readonly menueItem_AlleRollenAnzeigen: Locator;
    readonly menueItem_RolleAnlegen: Locator;
    readonly label_Schulverwaltung: Locator;
    readonly label_Schultraegerverwaltung: Locator;

    constructor(page){
        this.page = page;  
        this.header_label_Navigation = page.getByText('Navigation');
        this.button_BackStartpage = page.getByTestId('back-to-start-link');
        this.label_Benutzerverwaltung =  page.getByText('Benutzerverwaltung').first();
        this.menueItem_AlleBenutzerAnzeigen = page.getByTestId('user-management-menu-item');
        this.menueItem_BenutzerAnlegen = page.getByText('Neue Benutzer anlegen');
        this.label_Klassenverwaltung = page.getByText('Klassenverwaltung');
        this.label_Rollenverwaltung = page.getByText('Rollenverwaltung');
        this.menueItem_AlleRollenAnzeigen = page.getByText('Alle Rollen anzeigen');
        this.menueItem_RolleAnlegen = page.getByTestId('rolle-creation-menu-item');
        this.label_Schulverwaltung = page.getByText('Schulverwaltung');
        this.label_Schultraegerverwaltung =  page.getByText('Schulträgerverwaltung');
    }
}