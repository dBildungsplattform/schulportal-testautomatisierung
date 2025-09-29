import { type Locator, Page, expect } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { waitForAPIResponse } from '../../../base/api/baseApi';

export class PersonDetailsViewPage {
  readonly page: Page;
  readonly textH2BenutzerBearbeiten: Locator;

  // Persoenliche Daten
  readonly username: Locator;

  // Passwort
  readonly textH3PasswortHeadline: Locator;
  readonly buttonPwChange: Locator;
  readonly buttonPwReset: Locator;
  readonly textPwResetInfo: Locator;
  readonly inputPw: Locator;
  readonly buttonClosePwreset: Locator;

  // Benutzer löschen
  readonly buttonDeletePerson: Locator;
  readonly buttonDeletePersonConfirm: Locator;
  readonly buttonCloseDeletePersonConfirm: Locator;

  // Schulzuordnungen
  readonly textH3SchulzuordnungHeadline: Locator;
  readonly buttonEditSchulzuordnung: Locator;
  readonly button_deleteSchulzuordnung: Locator;
  readonly button_confirmDeleteSchulzuordnung: Locator;
  readonly buttonAddSchulzuordnung: Locator;
  readonly button_closeZuordnungSuccess: Locator;
  readonly buttonVersetzen: Locator;
  readonly comboboxOrganisation: Locator;
  readonly organisationInput: Locator;
  readonly comboboxOrganisationDialogBenutzerSperren: Locator;
  readonly comboboxRolle: Locator;
  readonly comboboxKlasse: Locator;
  readonly inputKopersNr: Locator;
  readonly buttonSubmitAddSchulzuordnung: Locator;
  readonly buttonConfirmAddSchulzuordnung: Locator;
  readonly buttonSaveAssignmentChanges: Locator;
  readonly buttonCloseSaveAssignmentChanges: Locator;
  readonly buttonBefristetSchuljahresende: Locator;
  readonly buttonBefristungUnbefristet: Locator;
  readonly buttonBefristungAendern: Locator;
  readonly buttonBefristungAendernSubmit: Locator;
  readonly buttonBefristungAendernConfirm: Locator;
  readonly buttonBefristungAendernSave: Locator;
  readonly buttonBefristungAendernSuccessClose: Locator;
  readonly inputBefristung: Locator;
  readonly errorTextInputBefristung: Locator;
  readonly radioButtonBefristungSchuljahresende: Locator;
  readonly radioButtonUnbefristet: Locator;
  readonly radioButtonUnbefristetDisabled: Locator;

  readonly buttonConfirmZuordnungDialogAddition: Locator;
  readonly organisationen: Autocomplete;
  readonly rollen: Autocomplete;
  readonly klassen: Autocomplete;
  readonly klassenVersetzen: Autocomplete;

  // Benutzer sperren
  readonly textH3LockPersonHeadline: Locator;
  readonly buttonLockPerson: Locator;
  readonly buttonLockPersonConfirm: Locator;
  readonly textH2DialogBenutzerSperren: Locator;
  readonly textInfoLockedUser: Locator;
  readonly iconLockedUser: Locator;
  readonly textLockedUser: Locator;
  readonly textUnlockedUser: Locator;
  readonly inputBefristungSperre: Locator;
  readonly radioButtonBefristet: Locator;
  readonly textSperrdatumAb: Locator;
  readonly textSperrdatumBis: Locator;

  // 2FA
  readonly textH3TwoFA: Locator;
  readonly textTokenIstEingerichtetInfo: Locator;
  readonly textNeuenTokenEinrichtenInfo: Locator;
  readonly textKeinTokenIstEingerichtet: Locator;
  readonly button2FAEinrichten: Locator;
  readonly text2FAInfo: Locator;
  readonly dialog2FAEinrichten: Locator;
  readonly textH2TwoFACardheadline: Locator;
  readonly selectOption2FASoftwareToken: Locator;
  readonly text2FASoftwareTokenInfo: Locator;
  readonly button2FAEinrichtenWeiter: Locator;
  readonly textSoftwareToken: Locator;
  readonly buttonCloseSoftwareTokenDialog: Locator;
  readonly button2FAZuruecksetzenWeiter: Locator;

  // Inbetriebnahme-Passwort für LK-Endgerät
  readonly buttonIBNPasswortEinrichtenDialog: Locator;
  readonly buttonIBNPasswortEinrichten: Locator;
  readonly infoIBNPasswortEinrichten: Locator;
  readonly buttonIBNPasswortEinrichtenDialogClose: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textH2BenutzerBearbeiten = page.getByTestId('person-details-card').getByTestId('layout-card-headline');

    // Persoenliche Daten
    this.username = page.getByTestId('person-username');

    // Passwort
    this.textH3PasswortHeadline = page.locator(`//h3[text()='Passwort']`);
    this.buttonPwChange = page.getByTestId('open-password-reset-dialog-button');
    this.buttonPwReset = page.getByTestId('password-reset-button');
    this.buttonVersetzen = page.getByTestId('klasse-change-button');
    this.textPwResetInfo = page.getByTestId('password-reset-info-text');
    this.inputPw = page.locator('[data-testid="password-output-field"] input');
    this.buttonClosePwreset = page.getByTestId('close-password-reset-dialog-button');

    // Benutzer löschen
    this.buttonDeletePerson = page.getByTestId('open-person-delete-dialog-button');
    this.buttonDeletePersonConfirm = page.getByTestId('person-delete-button');
    this.buttonCloseDeletePersonConfirm = page.getByTestId('close-person-delete-success-dialog-button');

    // Schulzuordnungen
    this.textH3SchulzuordnungHeadline = page.getByText('Schulzuordnung(en)');
    this.buttonEditSchulzuordnung = page
      .locator('div')
      .getByTestId('zuordnung-edit-button');
    this.buttonAddSchulzuordnung = page.getByTestId('zuordnung-create-button');
    this.button_closeZuordnungSuccess = page.getByTestId('close-zuordnung-delete-success-button');
    this.comboboxOrganisationDialogBenutzerSperren = page.getByTestId('person-lock-card').locator('.v-field__input');
    this.comboboxRolle = page.getByTestId('rolle-select');
    this.comboboxOrganisation = page.getByTestId('personenkontext-create-organisation-select');
    this.organisationInput = page.getByTestId('personenkontext-create-organisation-select').locator('input');
    this.button_deleteSchulzuordnung = page.getByTestId('open-zuordnung-delete-dialog-button');
    this.button_confirmDeleteSchulzuordnung = page.getByTestId('zuordnung-delete-button');
    this.comboboxKlasse = page.getByTestId('klassenname-input').getByRole('combobox');
    this.buttonConfirmZuordnungDialogAddition = page.getByTestId('confirm-zuordnung-dialog-addition');

    this.inputKopersNr = page.getByTestId('kopersnr-input').locator('.v-field__input');
    this.buttonSubmitAddSchulzuordnung = page.getByTestId('zuordnung-creation-submit-button');
    this.buttonConfirmAddSchulzuordnung = page.getByRole('button', { name: 'Ja' });
    this.buttonSaveAssignmentChanges = page.getByTestId('zuordnung-changes-save-button');
    this.buttonCloseSaveAssignmentChanges = page.getByRole('dialog').getByRole('button', { name: 'Schließen' });
    this.buttonBefristetSchuljahresende = page.getByLabel('Bis Schuljahresende (31.07.');
    this.buttonBefristungUnbefristet = page.getByLabel('Unbefristet');
    this.organisationen = new Autocomplete(this.page, this.comboboxOrganisation);
    this.rollen = new Autocomplete(this.page, this.comboboxRolle);
    this.klassen = new Autocomplete(this.page, this.comboboxKlasse);
    this.klassenVersetzen = new Autocomplete(this.page, page.getByTestId('klasse-change-klasse-select'));
    this.buttonBefristungAendern = page.getByTestId('befristung-change-button');
    this.buttonBefristungAendernSubmit = page.getByTestId('change-befristung-submit-button');
    this.buttonBefristungAendernConfirm = page.getByTestId('confirm-change-befristung-button');
    this.buttonBefristungAendernSave = page.getByTestId('zuordnung-changes-save-button');
    this.buttonBefristungAendernSuccessClose = page.getByTestId('change-befristung-success-dialog-close-button');
    this.inputBefristung = page.locator('[data-testid="befristung-input"] input');
    this.errorTextInputBefristung = page.getByText('Das eingegebene Datum darf nicht in der Vergangenheit liegen.');
    this.radioButtonBefristungSchuljahresende = page.getByTestId('schuljahresende-radio-button');
    this.radioButtonUnbefristet = page.getByTestId('unbefristet-radio-button');
    this.radioButtonUnbefristetDisabled = page.getByTestId('unbefristet-radio-button').getByLabel('Unbefristet');

    // Benutzer sperren
    this.textH3LockPersonHeadline = page.getByTestId('person-lock-info').getByText('Status');
    this.buttonLockPerson = page.getByTestId('open-lock-dialog-button');
    this.buttonLockPersonConfirm = page.getByTestId('lock-user-button');
    this.textH2DialogBenutzerSperren = page.getByTestId('person-lock-card').getByTestId('layout-card-headline');
    this.textInfoLockedUser = page.getByTestId('lock-user-info-text');
    this.iconLockedUser = page.getByTestId('person-lock-info').locator('i');
    this.textLockedUser = page.getByText('Dieser Benutzer ist gesperrt.');
    this.textUnlockedUser = page.getByText('Dieser Benutzer ist aktiv.');
    this.inputBefristungSperre = page.getByTestId('befristung-input').getByPlaceholder('TT.MM.JJJJ');
    this.radioButtonBefristet = page.getByTestId('befristet-radio-button').getByLabel('Befristet');
    this.textSperrdatumAb = page.getByTestId('lock-info-1-attribute');
    this.textSperrdatumBis = page.getByTestId('lock-info-2-attribute');

    // 2FA
    this.textH3TwoFA = page.getByText('Zwei-Faktor-Authentifizierung (2FA)');
    this.textKeinTokenIstEingerichtet = page.getByText('Für diesen Benutzer ist aktuell keine 2FA eingerichtet.');
    this.textTokenIstEingerichtetInfo = page.getByText(
      'Für diesen Benutzer ist aktuell ein Software-Token eingerichtet.'
    );
    this.textNeuenTokenEinrichtenInfo = page.getByText(
      'Um einen neuen Token einzurichten, muss der aktuelle Token durch die schulischen Administratorinnen und Administratoren zurückgesetzt werden.'
    );
    this.button2FAEinrichten = page.getByTestId('open-2FA-dialog-icon');
    this.dialog2FAEinrichten = page.getByTestId('two-factor-authentication-dialog');
    this.textH2TwoFACardheadline = this.dialog2FAEinrichten.getByTestId('layout-card-headline');
    this.text2FASoftwareTokenInfo = page.getByText(
      'Ein QR-Code wird generiert, welcher direkt eingescannt oder ausgedruckt werden kann.'
    );
    this.selectOption2FASoftwareToken = page.getByTestId('software-token-radio-button');
    this.button2FAEinrichtenWeiter = page.getByTestId('proceed-two-factor-authentication-dialog-button');
    this.textSoftwareToken = page.getByTestId('software-token-dialog-text');
    this.buttonCloseSoftwareTokenDialog = page.getByTestId('close-software-token-dialog-button');
    this.button2FAZuruecksetzenWeiter = page.getByTestId('two-way-authentification-set-up-button');

    // Inbetriebnahme-Passwort für LK-Endgerät
    this.buttonIBNPasswortEinrichtenDialog = page.getByTestId('open-device-password-dialog-button');
    this.buttonIBNPasswortEinrichten = page.getByTestId('password-reset-button');
    this.infoIBNPasswortEinrichten = page.getByTestId('password-reset-info-text');
    this.buttonIBNPasswortEinrichtenDialogClose = page.getByTestId('close-password-reset-dialog-button');
  }

  public async waitForPageToBeLoaded(): Promise<void> {
    await this.page.waitForURL('admin/personen/*');
    for (const locator of await this.page.getByRole('progressbar').all()) {
      await expect(locator).toBeHidden();
    }
  }

  public async lockUserWithoutDate(): Promise<void> {
    await this.buttonLockPerson.click();
    await expect(this.textH2DialogBenutzerSperren).toHaveText('Benutzer sperren');
    await expect(this.comboboxOrganisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
    await expect(this.textInfoLockedUser).toHaveText(
      'Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.'
    );
    await expect(this.inputBefristungSperre).toBeHidden();
    await this.buttonLockPersonConfirm.click();
  }

  public async lockUserWithDate(lockDateTo: string): Promise<void> {
    await this.buttonLockPerson.click();
    await expect(this.textH2DialogBenutzerSperren).toHaveText('Benutzer sperren');
    await expect(this.comboboxOrganisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
    await expect(this.textInfoLockedUser).toHaveText(
      'Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.'
    );
    await this.radioButtonBefristet.click();
    await expect(this.inputBefristungSperre).toBeVisible();
    await this.inputBefristungSperre.fill(lockDateTo);
    await this.buttonLockPersonConfirm.click();
  }

  public async checkUserIsLocked(): Promise<void> {
    await expect(this.iconLockedUser).toBeVisible();
    await expect(this.textLockedUser).toBeVisible();
  }

  public async checkLockDateFrom(lockDateFrom: string): Promise<void> {
    await expect(this.textSperrdatumAb).toHaveText(lockDateFrom);
  }

  public async checkLockDateTo(lockDateTo: string): Promise<void> {
    await expect(this.textSperrdatumBis).toHaveText(lockDateTo);
  }

  public async softwareTokenEinrichten(): Promise<void> {
    await this.button2FAEinrichten.click();
    await expect(this.textH2TwoFACardheadline).toHaveText('Zwei-Faktor-Authentifizierung einrichten');
    await expect(this.selectOption2FASoftwareToken).toHaveText('Software-Token einrichten');
    await expect(this.text2FASoftwareTokenInfo).toBeVisible();
    await this.button2FAEinrichtenWeiter.click();
    await waitForAPIResponse(this.page, '2fa-token/**/');
    await expect(this.textH2TwoFACardheadline).toHaveText('Software-Token einrichten');
    await expect(this.textSoftwareToken).toHaveText('QR-Code scannen oder ausdrucken.');
    await this.buttonCloseSoftwareTokenDialog.click();
  }

  public async createIbnPassword(): Promise<void> {
    await this.buttonIBNPasswortEinrichtenDialog.click();
    await this.buttonIBNPasswortEinrichten.click();
    await waitForAPIResponse(this.page, 'personen/**/uem-password');
    await expect(this.infoIBNPasswortEinrichten).toContainText('Das Passwort wurde erfolgreich erzeugt.');
    await this.buttonIBNPasswortEinrichtenDialogClose.click();
    await expect(this.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
  }

  public async validateEntireNameSchulzuordnung(
    dstNr: string,
    testschuleName: string,
    nameRolle: string,
    textColor: string,
    befristungLehrerRolle: string
  ): Promise<void> {
    await expect(
      this.page
        .getByTestId('person-details-card')
        .getByText(dstNr + ' (' + testschuleName + '): ' + nameRolle + ' (befristet bis ' + befristungLehrerRolle + ')')
    ).toHaveCSS('color', textColor);
  }
}
