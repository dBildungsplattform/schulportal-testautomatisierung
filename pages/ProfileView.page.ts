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
    // Schulzuordnung 1
    readonly cardHeadline_Schulzuordnung1: Locator;
    readonly label_Schule1: Locator;
    readonly data_Schule1: Locator;
    readonly label_Rolle1: Locator;
    readonly data_Rolle1: Locator;
    readonly label_Dienststellennummer1: Locator;
    readonly data_Dienststellennummer1: Locator;
    // Schulzuordnung 2
    readonly cardHeadline_Schulzuordnung2: Locator;
    readonly label_Schule2: Locator;
    readonly data_Schule2: Locator;
    readonly label_Rolle2: Locator;
    readonly data_Rolle2: Locator;
    readonly label_Dienststellennummer2: Locator;
    readonly data_Dienststellennummer2: Locator;
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
        this.button_ZurueckVorherigeSeite = page.getByTestId('back-to-previous-page-button');
        this.text_h2_Ueberschrift = page.getByTestId('profile-headline');
        // Persönliche Daten
        this.cardHeadline_PersoenlicheDaten = page.getByTestId('layout-card-headline-persoenliche-daten');
        this.label_VornameNachname = page.getByTestId('fullName-label');
        this.data_VornameNachname = page.getByTestId('fullName-value');
        this.label_Benutzername = page.getByTestId('userName-label');
        this.data_Benutzername = page.getByTestId('userName-value');
        this.label_KopersNr = page.getByTestId('kopersnummer-label');
        this.data_KopersNr = page.getByTestId('kopersnummer-value');
        this.icon_InfoPersoenlicheDaten = page.getByTestId('info-icon');
        // Die Schulzuordnungen sind als Tabelle dargestellt, darum sind Indizes in den Ids
        // Schulzuordnung 1
        this.cardHeadline_Schulzuordnung1 = page.getByTestId('zuordung-card-1');
        this.label_Schule1 = page.getByTestId('schule-label-1');
        this.data_Schule1 = page.getByTestId('schule-value-1');
        this.label_Rolle1 = page.getByTestId('rolle-label-1');
        this.data_Rolle1 = page.getByTestId('rolle-value-1');
        this.label_Dienststellennummer1 = page.getByTestId('dienststellennummer-label-1');
        this.data_Dienststellennummer1 = page.getByTestId('dienststellennummer-value-1');
        // Schulzuordnung 2
        this.cardHeadline_Schulzuordnung2 = page.getByTestId('zuordung-card-2');
        this.label_Schule2 = page.getByTestId('schule-label-2');
        this.data_Schule2 = page.getByTestId('schule-value-2');
        this.label_Rolle2 = page.getByTestId('rolle-label-2');
        this.data_Rolle2 = page.getByTestId('rolle-value-2');
        this.label_Dienststellennummer2 = page.getByTestId('dienststellennummer-label-2');
        this.data_Dienststellennummer2 = page.getByTestId('dienststellennummer-value-2');
        // Passwort
        this.cardHeadline_Passwort = page.getByTestId('new-password-card');
        this.icon_Schluessel_Passwort = page.getByTestId('password-icon');
        this.button_NeuesPasswortSetzen = page.getByTestId('open-change-password-dialog');
         // 2FA
         this.cardHeadline_2FA = page.getByTestId('two-factor-card');
         this.icon_Schild2FA = page.getByTestId('two-factor-icon');
         this.button_2FAEinrichten = page.getByTestId('setup-two-factor-button');
    }
}
