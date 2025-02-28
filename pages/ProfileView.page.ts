import { expect, Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly buttonZurueckVorherigeSeite: Locator;
  readonly titleMeinProfil: Locator;
  // Persönliche Daten
  readonly cardHeadlinePersoenlicheDaten: Locator;
  readonly labelVornameNachname: Locator;
  readonly dataVornameNachname: Locator;
  readonly labelBenutzername: Locator;
  readonly dataBenutzername: Locator;
  readonly labelKopersNr: Locator;
  readonly dataKopersNr: Locator;
  readonly iconInfoPersoenlicheDaten: Locator;
  // Schulzuordnung 1
  readonly cardHeadline_Schulzuordnung1: Locator;
  readonly labelSchule1: Locator;
  readonly dataSchule1: Locator;
  readonly labelRolle1: Locator;
  readonly dataRolle1: Locator;
  readonly labelDienststellennummer1: Locator;
  readonly dataDienststellennummer1: Locator;
  // Schulzuordnung 2
  readonly cardHeadline_Schulzuordnung2: Locator;
  readonly labelSchule2: Locator;
  readonly dataSchule2: Locator;
  readonly labelRolle2: Locator;
  readonly dataRolle2: Locator;
  readonly labelDienststellennummer2: Locator;
  readonly dataDienststellennummer2: Locator;
  // Passwort
  readonly cardHeadlinePasswort: Locator;
  readonly buttonStartPWChangeDialog: Locator;
  readonly buttonChangePW: Locator;
  readonly labelUsername: Locator;
  readonly textLoginPrompt: Locator;
  readonly inputPassword: Locator;
  // 2FA
  readonly cardHeadline2FA: Locator;
  readonly iconSchild2FA: Locator;
  readonly textNo2FA: Locator;
  readonly button2FAEinrichten: Locator;
  readonly text2FASelfServiceInfo: Locator;
  readonly text2FASelfServiceWarning: Locator;
  readonly button2FAAbbrechen: Locator;
  readonly button2FAWeiter: Locator;
  readonly text2FASelfServiceQRInfo: Locator;
  readonly data2FAQRCode: Locator;
  readonly textLayoutCardHeadline: Locator;
  readonly textOTPEntryInfo: Locator;
  readonly textOTPInput: Locator;
  readonly text2FASelfServiceError: Locator;
  readonly textOTPEntryError: Locator;

  // Inbetriebnahme-Passwort für LK-Endgerät
  readonly cardHeadlinePasswordLKEndgeraet: Locator;
  readonly infoTextSectionPasswordLKEndgeraet: Locator;
  readonly buttontPasswortErzeugenSectionLKEndgeraet: Locator;
  readonly infoTextDialogPasswordLKEndgeraet: Locator;
  readonly buttontPasswortErzeugenDialogLKEndgeraet: Locator;

  constructor(page) {
    this.page = page;
    this.buttonZurueckVorherigeSeite = page.getByTestId('back-to-previous-page-button');
    this.titleMeinProfil = page.getByTestId('profile-headline');
    // Persönliche Daten
    this.cardHeadlinePersoenlicheDaten = page.getByTestId('layout-card-headline-persoenliche-daten');
    this.labelVornameNachname = page.getByTestId('fullName-label');
    this.dataVornameNachname = page.getByTestId('fullName-value');
    this.labelBenutzername = page.getByTestId('userName-label');
    this.dataBenutzername = page.getByTestId('userName-value');
    this.labelKopersNr = page.getByTestId('kopersnummer-label');
    this.dataKopersNr = page.getByTestId('kopersnummer-value');
    this.iconInfoPersoenlicheDaten = page.getByTestId('info-icon');
    // Die Schulzuordnungen sind als Tabelle dargestellt, darum sind Indizes in den Ids
    // Schulzuordnung 1
    this.cardHeadline_Schulzuordnung1 = page.getByTestId('zuordung-card-1');
    this.labelSchule1 = page.getByTestId('schule-label-1');
    this.dataSchule1 = page.getByTestId('schule-value-1');
    this.labelRolle1 = page.getByTestId('rolle-label-1');
    this.dataRolle1 = page.getByTestId('rolle-value-1');
    this.labelDienststellennummer1 = page.getByTestId('dienststellennummer-label-1');
    this.dataDienststellennummer1 = page.getByTestId('dienststellennummer-value-1');
    // Schulzuordnung 2
    this.cardHeadline_Schulzuordnung2 = page.getByTestId('zuordung-card-2');
    this.labelSchule2 = page.getByTestId('schule-label-2');
    this.dataSchule2 = page.getByTestId('schule-value-2');
    this.labelRolle2 = page.getByTestId('rolle-label-2');
    this.dataRolle2 = page.getByTestId('rolle-value-2');
    this.labelDienststellennummer2 = page.getByTestId('dienststellennummer-label-2');
    this.dataDienststellennummer2 = page.getByTestId('dienststellennummer-value-2');
    // Passwort
    this.cardHeadlinePasswort = page.getByTestId('new-password-card');
    this.buttonStartPWChangeDialog = page.getByTestId('open-change-password-dialog-button');
    this.buttonChangePW = page.getByTestId('change-password-button');
    this.labelUsername = page.locator('#kc-attempted-username');
    this.textLoginPrompt = page.getByTestId('login-prompt-text');
    this.inputPassword = page.getByTestId('password-input');

    // 2FA
    this.cardHeadline2FA = page.getByTestId('two-factor-card');
    this.textNo2FA = page.getByText('Es wurde noch kein zweiter Faktor für Sie eingerichtet.');
    this.button2FAEinrichten = page.getByTestId('open-2FA-self-service-dialog-icon');
    this.text2FASelfServiceInfo = page.getByTestId('self-service-dialog-info-text');
    this.text2FASelfServiceWarning = page.getByTestId('self-service-dialog-warning-text');
    this.button2FAAbbrechen = page.getByTestId('close-two-factor-authentication-dialog');
    this.button2FAWeiter = page.getByTestId('proceed-two-factor-authentication-dialog');
    this.text2FASelfServiceQRInfo = page.getByTestId('self-service-dialog-qr-info-text');
    this.data2FAQRCode = page.getByTestId('software-token-dialog-qr-code');
    this.textOTPEntryInfo = page.getByTestId('self-service-otp-entry-info-text');
    this.textOTPEntryError = page.getByTestId('self-service-otp-error-text');
    this.textOTPInput = page.getByTestId('self-service-otp-input');
    this.text2FASelfServiceError = page.getByTestId('self-service-token-verify-error-text');

    // Modal
    this.textLayoutCardHeadline = page.getByTestId('layout-card-headline');

    // Inbetriebnahme-Passwort für LK-Endgerät
    this.cardHeadlinePasswordLKEndgeraet = page.getByRole('heading', {
      name: 'Inbetriebnahme-Passwort für LK-Endgerät',
    });
    this.infoTextSectionPasswordLKEndgeraet = page.getByText(
      'Sie benötigen dieses Passwort ausschließlich zur einmaligen Eingabe beim ersten Start Ihres neuen LK-Endgerätes oder wenn das Gerät zurückgesetzt wurde!'
    );
    this.buttontPasswortErzeugenSectionLKEndgeraet = page.getByTestId('open-device-password-dialog-button');
    this.infoTextDialogPasswordLKEndgeraet = page.getByTestId('password-reset-info-text');
    this.buttontPasswortErzeugenDialogLKEndgeraet = page.getByTestId('password-reset-button');
  }

  public async checkSectionPersoenlicheDaten(vorname: string, nachname: string, usernames: string[]) {
    await expect(this.cardHeadlinePersoenlicheDaten).toHaveText('Persönliche Daten');
    await expect(this.labelVornameNachname).toHaveText('Vor- und Nachname:');
    await expect(this.dataVornameNachname).toHaveText(vorname + ' ' + nachname);
    await expect(this.labelBenutzername).toHaveText('Benutzername:');
    await expect(this.dataBenutzername).toHaveText(usernames[0]);
    await expect(this.labelKopersNr).toBeHidden();
    await expect(this.dataKopersNr).toBeHidden();
    await expect(this.iconInfoPersoenlicheDaten).toBeVisible();
  }
}
