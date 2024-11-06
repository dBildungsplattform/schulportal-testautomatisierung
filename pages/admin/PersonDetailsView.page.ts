import { type Locator, Page } from '@playwright/test';

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
    readonly button_editSchoollAssignment: Locator;
    readonly button_addSchoollAssignment: Locator;
    readonly combobox_organisation: Locator;
    readonly combobox_rolle: Locator;
    readonly input_kopersNr: Locator;
    readonly button_addSchoollAssignmentSubmit: Locator;
    readonly button_confirmAddSchoollAssignment: Locator;
    readonly button_saveAssignmentChanges: Locator;
    readonly button_closeSaveAssignmentChanges: Locator;
    
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
        this.button_editSchoollAssignment = page.locator('div').filter({ hasText: /^Schulzuordnung\(en\)Bearbeiten$/ }).getByTestId('zuordnung-edit-button');
        this.button_addSchoollAssignment = page.getByTestId('zuordnung-create-button');
        this.combobox_organisation = page.getByTestId('organisation-select').locator('.v-field__input');
        this.combobox_rolle = page.getByTestId('rolle-select').locator('.v-field__input');
        this.input_kopersNr = page.getByTestId('kopersnr-input').locator('.v-field__input');
        this.button_addSchoollAssignmentSubmit = page.getByTestId('zuordnung-creation-submit-button');
        this.button_confirmAddSchoollAssignment = page.getByRole('button', { name: 'Ja' });
        this.button_saveAssignmentChanges = page.getByTestId('zuordnung-changes-save');
        this.button_closeSaveAssignmentChanges = page.getByRole('dialog').getByRole('button', { name: 'Schließen' });
    }
}