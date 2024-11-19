import { type Locator, Page, expect } from '@playwright/test';

export class PersonDetailsViewPage{
    readonly page: Page;
    readonly text_h2_benutzerBearbeiten: Locator;

    // Passwort
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
    readonly button_editSchulzuordnung: Locator;
    readonly button_addSchulzuordnung: Locator;
    readonly combobox_organisation: Locator;
    readonly combobox_organisationDialogBenutzerSperren: Locator;
    readonly combobox_rolle: Locator;
    readonly input_kopersNr: Locator;
    readonly button_submitAddSchulzuordnung: Locator;
    readonly button_confirmAddSchulzuordnung: Locator;
    readonly button_saveAssignmentChanges: Locator;
    readonly button_closeSaveAssignmentChanges: Locator;
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
    
    constructor(page){
        this.page = page;  
        this.text_h2_benutzerBearbeiten = page.getByTestId('layout-card-headline');

        // Passwort
        this.button_pwChange = page.getByTestId('open-password-reset-dialog-icon');     
        this.button_pwReset = page.getByTestId('password-reset-button');
        this.text_pwResetInfo = page.getByTestId('password-reset-info-text');
        this.input_pw = page.locator('[data-testid="password-output-field"] input'); 
        this.button_close_pwreset = page.getByTestId('close-password-reset-dialog-button');

        // Benutzer löschen
        this.button_deletePerson = page.getByTestId('open-person-delete-dialog-button');
        this.button_deletePersonConfirm = page.getByTestId('person-delete-button');
        this.button_closeDeletePersonConfirm = page.getByTestId('close-person-delete-success-dialog-button');

        // Schulzuordnungen
        this.button_editSchulzuordnung = page.locator('div').filter({ hasText: /^Schulzuordnung\(en\)Bearbeiten$/ }).getByTestId('zuordnung-edit-button');
        this.button_addSchulzuordnung = page.getByTestId('zuordnung-create-button');
        this.combobox_organisationDialogBenutzerSperren = page.getByTestId('person-lock-card').locator('.v-field__input');
        this.combobox_organisation = page.getByTestId('organisation-select').locator('.v-field__input');
        this.combobox_rolle = page.getByTestId('rolle-select').locator('.v-field__input');
        this.input_kopersNr = page.getByTestId('kopersnr-input').locator('.v-field__input');
        this.button_submitAddSchulzuordnung = page.getByTestId('zuordnung-creation-submit-button');
        this.button_confirmAddSchulzuordnung = page.getByRole('button', { name: 'Ja' });
        this.button_saveAssignmentChanges = page.getByTestId('zuordnung-changes-save');
        this.button_closeSaveAssignmentChanges = page.getByRole('dialog').getByRole('button', { name: 'Schließen' });
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
    }

    public async lockUserWithoutDate() {
        await this.button_lockPerson.click();
        await expect(this.text_h2_dialogBenutzerSperren).toHaveText('Benutzer sperren');
        await expect(this.combobox_organisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
        await expect(this.text_infoLockedUser).toHaveText('Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.');
        await expect(this.input_befristungSperre).toBeHidden();
        await this.button_lockPersonConfirm.click()
    }

    public async lockUserWithDate(lockDateTo) {
        await this.button_lockPerson.click();
        await expect(this.text_h2_dialogBenutzerSperren).toHaveText('Benutzer sperren');
        await expect(this.combobox_organisationDialogBenutzerSperren).toHaveText('Land Schleswig-Holstein');
        await expect(this.text_infoLockedUser).toHaveText('Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.');
        await this.radio_button_befristet.click();
        await expect(this.input_befristungSperre).toBeVisible();
        await this.input_befristungSperre.fill(lockDateTo);
        await this.button_lockPersonConfirm.click()
    }

    public async checkUserIslocked() {
        await expect(this.icon_lockedUser).toBeVisible();
        await expect(this.text_lockedUser).toBeVisible();
    }

    public async checkLockDateFrom(lockDateFrom: string) {
        await expect(this.text_sperrdatumAb).toHaveText(lockDateFrom);
    }

    public async checkLockDateTo(lockDateTo: string) {
        await expect(this.text_sperrdatumBis).toHaveText(lockDateTo);
    }
}