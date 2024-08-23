import { type Locator, Page } from '@playwright/test';

export class ProfilePage{
    readonly page: Page;
    readonly button_ZurueckVorherigeSeite: Locator;
    readonly text_h2_Ueberschrift: Locator;
    // Persönliche Daten
    readonly cardHeadline_PersoenlicheDaten: Locator;
    readonly label_VornameNachname: Locator;
    readonly data_VornameNachname: Locator;
    readonly label_Benutzername: Locator;
    readonly data_Benutzername: Locator;
    readonly label_KopersNr: Locator;
    readonly data_KopersNr: Locator;
    readonly icon_InfoPersoenlicheDaten: Locator;
    // Schulzuordnung
    readonly cardHeadline_Schulzuordnung: Locator;
    readonly label_Schule: Locator;
    readonly data_Schule: Locator;
    readonly label_Rolle: Locator;
    readonly data_Rolle: Locator;
    readonly label_Dienststellennummer: Locator;
    readonly data_Dienststellennummer: Locator;
    // Passwort
    readonly cardHeadline_Passwort: Locator;
    readonly icon_Schluessel_Passwort: Locator;
    readonly button_NeuesPasswortSetzen: Locator;
    // 2FA
    readonly cardHeadline_2FA: Locator;
    readonly icon_Schild2FA: Locator;
    readonly button_2FAEinrichten: Locator;

    constructor(page){
        this.page = page;  
        this.button_ZurueckVorherigeSeite = page.getByRole('button', { name: 'Zurück zur vorherigen Seite' });
        this.text_h2_Ueberschrift = page.getByTestId('profile-headline');
        // Persönliche Daten
        this.cardHeadline_PersoenlicheDaten = page.getByTestId('layout-card-headline-persoenliche-daten');
        this.label_VornameNachname = page.getByTestId('fullName-label');
        this.data_VornameNachname = page.getByTestId('fullName-value');
        this.label_Benutzername = page.getByTestId('userName-label');
        this.data_Benutzername = page.getByTestId('userName-value');
        this.label_KopersNr = page.getByTestId('koPersNummer-label');
        this.data_KopersNr = page.getByTestId('koPersNummer-value');
        this.icon_InfoPersoenlicheDaten = page.getByTestId('info-icon');
        // Schulzuordnung 1: Die Schulzuordnungen sind als Tabelle dargestellt, darum sind in den IDs Indexe
        this.cardHeadline_Schulzuordnung = page.getByTestId('zuordung-card-0');
        this.label_Schule = page.getByTestId('schule-label-0');
        this.data_Schule = page.getByTestId('schule-value-0');
        this.label_Rolle = page.getByTestId('rolle-label-0');
        this.data_Rolle = page.getByTestId('rolle-value-0');
        this.label_Dienststellennummer = page.getByTestId('dienstStellenNummer-label-0');
        this.data_Dienststellennummer = page.getByTestId('dienstStellenNummer-value-0');
        // Passwort
        this.cardHeadline_Passwort = page.getByTestId('new-password-card');
        this.icon_Schluessel_Passwort = page.getByTestId('password-icon');
        this.button_NeuesPasswortSetzen = page.getByTestId('set-new-password-button');
         // 2FA
         this.cardHeadline_2FA = page.getByTestId('two-factor-card');
         this.icon_Schild2FA = page.getByTestId('two-factor-icon');
         this.button_2FAEinrichten = page.getByTestId('setup-two-factor-button');
    }
}

// Hinweis für FR branch 930
// 1) die id data-testid="koPersNummer-label" nimmt am ende den Doppelpunkt nicht mit; 
// 2 )ebenso bei DStNr 
// 3) der button Passwort setzen is disabled, ist dein branch nicht aktuell? 
// 4) button_ZurueckVorherigeSeite hat keine TestId 