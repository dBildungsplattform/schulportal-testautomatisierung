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
    readonly text_InfoPersoenlicheDaten: Locator;
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
    readonly icon_Schluessel_PersoenlicheDaten: Locator;
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
        this.cardHeadline_PersoenlicheDaten = page.getByRole('heading', { name: 'Persönliche Daten' })
        this.label_VornameNachname = page.getByText('Vor- und Nachname:');
        this.data_VornameNachname = page.getByTestId('all-service-provider-title');
        this.label_Benutzername = page.getByTestId('all-service-provider-title');
        this.data_Benutzername = page.getByTestId('all-service-provider-title');
        this.label_KopersNr = page.getByTestId('all-service-provider-title');
        this.data_KopersNr = page.getByTestId('all-service-provider-title');
        this.text_InfoPersoenlicheDaten = page.getByTestId('all-service-provider-title');
        // Schulzuordnung
        this.cardHeadline_Schulzuordnung = page.getByTestId('all-service-provider-title');
        this.label_Schule = page.getByTestId('all-service-provider-title');
        this.data_Schule = page.getByTestId('all-service-provider-title');
        this.label_Rolle = page.getByTestId('all-service-provider-title');
        this.data_Rolle = page.getByTestId('all-service-provider-title');
        this.label_Dienststellennummer = page.getByTestId('all-service-provider-title');
        this.data_Dienststellennummer = page.getByTestId('all-service-provider-title');
        // Passwort
        this.cardHeadline_Passwort = page.getByTestId('all-service-provider-title');
        this.icon_Schluessel_PersoenlicheDaten = page.getByTestId('all-service-provider-title');
        this.button_NeuesPasswortSetzen = page.getByTestId('all-service-provider-title');
         // 2FA
         this.cardHeadline_2FA = page.getByTestId('all-service-provider-title');
         this.icon_Schild2FA = page.getByTestId('all-service-provider-title');
         this.button_2FAEinrichten = page.getByTestId('all-service-provider-title');
    }
}