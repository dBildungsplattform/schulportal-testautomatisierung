import { type Locator, Page } from '@playwright/test';

export class PersonDetailsViewPage{
    readonly page: Page;
    readonly text_h2_BenutzerBearbeiten: Locator;
    readonly button_pwChange: Locator;
    readonly button_pwReset: Locator;
    readonly text_pwResetInfo: Locator; 
    readonly input_pw: Locator;
    readonly button_close_pwreset: Locator;
    readonly button_deletePerson: Locator;
    readonly button_deletePersonConfirm: Locator;
    readonly button_closeDeletePersonConfirm: Locator;
    readonly button_lockPerson: Locator;
    readonly button_lockPersonConfirm: Locator;
    readonly text_h2_dialogBenutzerSperren: Locator;
    readonly combobox_organisation: Locator;
    readonly text_infoLockedUser: Locator;
    readonly icon_lockedUser: Locator;
    readonly text_lockedUser: Locator;
    readonly input_befristungSperre: Locator;
    readonly radio_button_befristet: Locator;
    readonly text_sperrdatumAb: Locator;
    readonly text_sperrdatumBis: Locator;
    
    constructor(page){
        this.page = page;  
        this.text_h2_BenutzerBearbeiten = page.getByTestId('layout-card-headline');
        this.button_pwChange = page.getByTestId('open-password-reset-dialog-icon');     
        this.button_pwReset = page.getByTestId('password-reset-button');
        this.text_pwResetInfo = page.getByTestId('password-reset-info-text');
        this.input_pw = page.locator('[data-testid="password-output-field"] input'); 
        this.button_close_pwreset = page.getByTestId('close-password-reset-dialog-button');
        this.button_deletePerson = page.getByTestId('open-person-delete-dialog-button');
        this.button_deletePersonConfirm = page.getByTestId('person-delete-button');
        this.button_closeDeletePersonConfirm = page.getByTestId('close-person-delete-success-dialog-button');
        this.button_lockPerson = page.getByTestId('open-lock-dialog-icon');
        this.button_lockPersonConfirm = page.getByTestId('lock-user-button');
        this.text_h2_dialogBenutzerSperren = page.getByTestId('person-lock-card').getByTestId('layout-card-headline');
        this.combobox_organisation = page.locator('.v-select__selection-text');
        this.text_infoLockedUser = page.getByTestId('lock-user-info-text');
        this.icon_lockedUser = page.getByTestId('person-lock-info').locator('i');
        this.text_lockedUser = page.getByText('Dieser Benutzer ist gesperrt.');
        this.input_befristungSperre = page.getByTestId('befristung-input').getByPlaceholder('TT.MM.JJJJ');
        this.radio_button_befristet = page.getByTestId('befristet-radio-button').getByLabel('Befristet');
        this.text_sperrdatumAb = page.getByTestId('lock-info-1-attribute');
        this.text_sperrdatumBis = page.getByTestId('lock-info-2-attribute');
    }
}