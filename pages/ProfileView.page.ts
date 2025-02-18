import { type Locator, Page } from '@playwright/test';

export class ProfilePage {
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
  readonly button_PasswortAendern: Locator;
  readonly label_username: Locator;
  readonly text_p_LoginPrompt: Locator;
  readonly input_password: Locator;
  // 2FA
  readonly cardHeadline_2FA: Locator;
  readonly icon_Schild2FA: Locator;
  readonly text_no2FA: Locator;
  readonly button_2FAEinrichten: Locator;
  readonly text_2FASelfServiceInfo: Locator;
  readonly text_2FASelfServiceWarning: Locator;
  readonly button_2FAAbbrechen: Locator;
  readonly button_2FAWeiter: Locator;
  readonly text_2FASelfServiceQRInfo: Locator;
  readonly data_2FAQRCode: Locator;
  readonly text_LayoutCardHeadline: Locator;
  readonly text_OTPEntryInfo: Locator;
  readonly text_OTPInput: Locator;
  readonly text_2FASelfServiceError: Locator;
  readonly text_OTPEntryError: Locator;

  constructor(page) {
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
    this.button_NeuesPasswortSetzen = page.getByTestId('open-change-password-dialog-button');
    this.button_PasswortAendern = page.getByTestId('change-password-button');
    this.label_username = page.locator('#kc-attempted-username');
    this.text_p_LoginPrompt = page.getByTestId('login-prompt-text');
    this.input_password = page.getByTestId('password-input');

    // 2FA
    this.cardHeadline_2FA = page.getByTestId('two-factor-card');
    this.text_no2FA = page.getByText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
    this.button_2FAEinrichten = page.getByTestId('open-2FA-self-service-dialog-icon');
    this.text_2FASelfServiceInfo = page.getByTestId('self-service-dialog-info-text');
    this.text_2FASelfServiceWarning = page.getByTestId('self-service-dialog-warning-text');
    this.button_2FAAbbrechen = page.getByTestId('close-two-factor-authentication-dialog');
    this.button_2FAWeiter = page.getByTestId('proceed-two-factor-authentication-dialog');
    this.text_2FASelfServiceQRInfo = page.getByTestId('self-service-dialog-qr-info-text');
    this.data_2FAQRCode = page.getByTestId('software-token-dialog-qr-code');
    this.text_OTPEntryInfo = page.getByTestId('self-service-otp-entry-info-text');
    this.text_OTPEntryError = page.getByTestId('self-service-otp-error-text');
    this.text_OTPInput = page.getByTestId('self-service-otp-input');
    this.text_2FASelfServiceError = page.getByTestId('self-service-token-verify-error-text');

    // Modal
    this.text_LayoutCardHeadline = page.getByTestId('layout-card-headline');
  }
}
