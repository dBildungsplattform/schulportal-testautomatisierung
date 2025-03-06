import { type Locator, Page, expect } from '@playwright/test';
import { ComboBox } from '../../elements/ComboBox';

export class PersonDetailsViewPage {
  readonly page: Page;
  readonly text_h2_benutzerBearbeiten: Locator;

  // Persoenliche Daten
  readonly username: Locator;

  // Passwort
  readonly text_h3_passwort_headline: Locator;
  readonly button_pwChange: Locator;
  readonly button_pwReset: Locator;
  readonly text_pwResetInfo: Locator;
  readonly input_pw: Locator;
  readonly button_close_pwreset: Locator;

  // Benutzer löschen
  readonly button_deletePerson: Locator;
  readonly button_deletePersonConfirm: Locator;
  readonly button_closeDeletePersonConfirm: Locator;

  // Schulzuordnungen
  readonly text_h3_schulzuordnung_headline: Locator;
  readonly button_editSchulzuordnung: Locator;
  readonly button_addSchulzuordnung: Locator;
  readonly combobox_organisation: Locator;
  readonly comboboxOrganisationInput: Locator;
  readonly combobox_organisationDialogBenutzerSperren: Locator;
  readonly combobox_rolle: Locator;
  readonly input_kopersNr: Locator;
  readonly button_submitAddSchulzuordnung: Locator;
  readonly button_confirmAddSchulzuordnung: Locator;
  readonly button_saveAssignmentChanges: Locator;
  readonly button_closeSaveAssignmentChanges: Locator;
  readonly button_befristetSchuljahresende: Locator;
  readonly button_befristungUnbefristet: Locator;

  readonly organisationen: ComboBox;
  readonly organisationenInput: ComboBox;
  readonly rollen: ComboBox;

  // Benutzer sperren
  readonly text_h3_lockPerson_headline: Locator;
  readonly button_lockPerson: Locator;
  readonly button_lockPersonConfirm: Locator;
  readonly text_h2_dialogBenutzerSperren: Locator;
  readonly text_infoLockedUser: Locator;
  readonly icon_lockedUser: Locator;
  readonly text_lockedUser: Locator;
  readonly text_unlockedUser: Locator;
  readonly input_befristungSperre: Locator;
  readonly radio_button_befristet: Locator;
  readonly text_sperrdatumAb: Locator;
  readonly text_sperrdatumBis: Locator;

  // 2FA
  readonly text_h3_2FA: Locator;
  readonly text_token_IstEingerichtet_info: Locator;
  readonly text_neuen_token_einrichten_info: Locator;
  readonly text_kein_token_ist_Eingerichtet: Locator;
  readonly button_2FAEinrichten: Locator;
  readonly text_2FA_info: Locator;
  readonly dialog_2FA_Einrichten: Locator;
  readonly text_h2_2FA_cardheadline: Locator;
  readonly selectOption_2FA_softwareToken: Locator;
  readonly text_2FA_softwareToken_info: Locator;
  readonly button_2FA_Einrichten_Weiter: Locator;
  readonly button_close_softwareToken_dialog: Locator;
  readonly button_2FA_Zuruecksetzen_Weiter: Locator;

  // Inbetriebnahme-Passwort für LK-Endgerät
  readonly buttonIBNPasswortEinrichtenDialog: Locator;
  readonly buttonIBNPasswortEinrichten: Locator;
  readonly infoIBNPasswortEinrichten: Locator;
  readonly buttonIBNPasswortEinrichtenDialogClose: Locator;

  constructor(page) {
    this.page = page;
    this.text_h2_benutzerBearbeiten = page.getByTestId('person-details-card').getByTestId('layout-card-headline');

    // Persoenliche Daten
    this.username = page.getByTestId('person-username');

    // Passwort
    this.text_h3_passwort_headline = page.locator(`//h3[text()='Passwort']`);
    this.button_pwChange = page.getByTestId('open-password-reset-dialog-button');
    this.button_pwReset = page.getByTestId('password-reset-button');
    this.text_pwResetInfo = page.getByTestId('password-reset-info-text');
    this.input_pw = page.locator('[data-testid="password-output-field"] input');
    this.button_close_pwreset = page.getByTestId('close-password-reset-dialog-button');

    // Benutzer löschen
    this.button_deletePerson = page.getByTestId('open-person-delete-dialog-button');
    this.button_deletePersonConfirm = page.getByTestId('person-delete-button');
    this.button_closeDeletePersonConfirm = page.getByTestId('close-person-delete-success-dialog-button');

    // Schulzuordnungen
    this.text_h3_schulzuordnung_headline = page.getByText('Schulzuordnung(en)');
    this.button_editSchulzuordnung = page
      .locator('div')
      .filter({ hasText: /^Schulzuordnung\(en\)Bearbeiten$/ })
      .getByTestId('zuordnung-edit-button');
    this.button_addSchulzuordnung = page.getByTestId('zuordnung-create-button');
    this.combobox_organisationDialogBenutzerSperren = page.getByTestId('person-lock-card').locator('.v-field__input');
    this.combobox_organisation = page.getByTestId('organisation-select').locator('.v-field__input');
    this.combobox_rolle = page.getByTestId('rolle-select').locator('.v-field__input');
    this.combobox_organisation = page.getByTestId('organisation-select').locator('.v-field');
    this.comboboxOrganisationInput = page.getByTestId('organisation-select').locator('input');

    this.combobox_rolle = page.getByTestId('rolle-select').locator('.v-field');
    this.input_kopersNr = page.getByTestId('kopersnr-input').locator('.v-field__input');
    this.button_submitAddSchulzuordnung = page.getByTestId('zuordnung-creation-submit-button');
    this.button_confirmAddSchulzuordnung = page.getByRole('button', { name: 'Ja' });
    this.button_saveAssignmentChanges = page.getByTestId('zuordnung-changes-save');
    this.button_closeSaveAssignmentChanges = page.getByRole('dialog').getByRole('button', { name: 'Schließen' });
    this.button_befristetSchuljahresende = page.getByLabel('Bis Schuljahresende (31.07.');
    this.button_befristungUnbefristet = page.getByLabel('Unbefristet');
    this.organisationen = new ComboBox(this.page, this.combobox_organisation);
    this.organisationenInput = new ComboBox(this.page, this.comboboxOrganisationInput);
    this.rollen = new ComboBox(this.page, this.combobox_rolle);

    // Benutzer sperren
    this.text_h3_lockPerson_headline = page.getByTestId('person-lock-info').getByText('Status');
    this.button_lockPerson = page.getByTestId('open-lock-dialog-button');
    this.button_lockPersonConfirm = page.getByTestId('lock-user-button');
    this.text_h2_dialogBenutzerSperren = page.getByTestId('person-lock-card').getByTestId('layout-card-headline');
    this.text_infoLockedUser = page.getByTestId('lock-user-info-text');
    this.icon_lockedUser = page.getByTestId('person-lock-info').locator('i');
    this.text_lockedUser = page.getByText('Dieser Benutzer ist gesperrt.');
    this.text_unlockedUser = page.getByText('Dieser Benutzer ist aktiv.');
    this.input_befristungSperre = page.getByTestId('befristung-input').getByPlaceholder('TT.MM.JJJJ');
    this.radio_button_befristet = page.getByTestId('befristet-radio-button').getByLabel('Befristet');
    this.text_sperrdatumAb = page.getByTestId('lock-info-1-attribute');
    this.text_sperrdatumBis = page.getByTestId('lock-info-2-attribute');

    // 2FA
    this.text_h3_2FA = page.getByText('Zwei-Faktor-Authentifizierung (2FA)');
    this.text_kein_token_ist_Eingerichtet = page.getByText('Für diesen Benutzer ist aktuell keine 2FA eingerichtet.');
    this.text_token_IstEingerichtet_info = page.getByText(
      'Für diesen Benutzer ist aktuell ein Software-Token eingerichtet.'
    );
    this.text_neuen_token_einrichten_info = page.getByText(
      'Um einen neuen Token einzurichten, muss der aktuelle Token durch die schulischen Administratorinnen und Administratoren zurückgesetzt werden.'
    );
    this.button_2FAEinrichten = page.getByTestId('open-2FA-dialog-icon');
    this.dialog_2FA_Einrichten = page.getByTestId('two-factor-authentication-dialog');
    this.text_h2_2FA_cardheadline = this.dialog_2FA_Einrichten.getByTestId('layout-card-headline');
    this.text_2FA_softwareToken_info = page.getByText(
      'Ein QR-Code wird generiert, welcher direkt eingescannt oder ausgedruckt werden kann.'
    );
    this.selectOption_2FA_softwareToken = page.getByTestId('software-token-radio-button');
    this.button_2FA_Einrichten_Weiter = page.getByTestId('proceed-two-factor-authentication-dialog-button');
    this.button_close_softwareToken_dialog = page.getByTestId('close-software-token-dialog-button');
    this.button_2FA_Zuruecksetzen_Weiter = page.getByTestId('two-way-authentification-set-up-button');

    // Inbetriebnahme-Passwort für LK-Endgerät
    this.buttonIBNPasswortEinrichtenDialog = page.getByTestId('open-device-password-dialog-button');
    this.buttonIBNPasswortEinrichten = page.getByTestId('password-reset-button');
    this.infoIBNPasswortEinrichten = page.getByTestId('password-reset-info-text');
    this.buttonIBNPasswortEinrichtenDialogClose = page.getByTestId('close-password-reset-dialog-button');
  }

  public async lockUserWithoutDate() {
    await this.button_lockPerson.click();
    await expect(this.text_h2_dialogBenutzerSperren).toHaveText('Benutzer sperren');
    await expect(this.combobox_organisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
    await expect(this.text_infoLockedUser).toHaveText(
      'Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.'
    );
    await expect(this.input_befristungSperre).toBeHidden();
    await this.button_lockPersonConfirm.click();
  }

  public async lockUserWithDate(lockDateTo) {
    await this.button_lockPerson.click();
    await expect(this.text_h2_dialogBenutzerSperren).toHaveText('Benutzer sperren');
    await expect(this.combobox_organisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
    await expect(this.text_infoLockedUser).toHaveText(
      'Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.'
    );
    await this.radio_button_befristet.click();
    await expect(this.input_befristungSperre).toBeVisible();
    await this.input_befristungSperre.fill(lockDateTo);
    await this.button_lockPersonConfirm.click();
  }

  public async checkUserIsLocked() {
    await expect(this.icon_lockedUser).toBeVisible();
    await expect(this.text_lockedUser).toBeVisible();
  }

  public async checkLockDateFrom(lockDateFrom: string) {
    await expect(this.text_sperrdatumAb).toHaveText(lockDateFrom);
  }

  public async checkLockDateTo(lockDateTo: string) {
    await expect(this.text_sperrdatumBis).toHaveText(lockDateTo);
  }

  public async softwareTokenEinrichten() {
    await this.button_2FAEinrichten.click();
    await expect(this.text_h2_2FA_cardheadline).toHaveText('Zwei-Faktor-Authentifizierung einrichten');
    await expect(this.selectOption_2FA_softwareToken).toHaveText('Software-Token einrichten');
    await expect(this.text_2FA_softwareToken_info).toBeVisible();
    await this.button_2FA_Einrichten_Weiter.click();
    await expect(this.text_h2_2FA_cardheadline).toHaveText('Software-Token einrichten');
    await this.button_close_softwareToken_dialog.click();
  }

  public async createIbnPassword() {
    await this.buttonIBNPasswortEinrichtenDialog.click();
    await this.buttonIBNPasswortEinrichten.click();
    await expect(this.infoIBNPasswortEinrichten).toContainText('Das Passwort wurde erfolgreich erzeugt.');
    await this.buttonIBNPasswortEinrichtenDialogClose.click();
    await expect(this.text_h2_benutzerBearbeiten).toHaveText('Benutzer bearbeiten');
  }
}
