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
    
    constructor(page){
        this.page = page;  
        this.text_h2_BenutzerBearbeiten = page.getByTestId('layout-card-headline');
        this.button_pwChange = page.getByTestId('open-password-reset-dialog-icon');     
        this.button_pwReset = page.getByTestId('password-reset-button');
        this.text_pwResetInfo = page.getByTestId('password-reset-info-text');
        this.input_pw = page.locator('[data-testid="password-output-field"] input'); 
        this.button_close_pwreset = page.getByTestId('close-password-reset-dialog-button');
        this.button_deletePerson = page.getByTestId('open-person-delete-dialog-icon');
        this.button_deletePersonConfirm = page.getByTestId('person-delete-button');
        this.button_closeDeletePersonConfirm = page.getByTestId('close-person-delete-success-dialog-button');
    }
}