import { type Locator, Page } from '@playwright/test';

export class PersonDetailsViewPage{
    readonly page: Page;
    readonly text_h2_BenutzerBearbeiten: Locator;
    readonly button_pwChange: Locator;
    readonly button_pwReset: Locator;
    readonly text_pwResetInfo: Locator; 
    readonly icon_pwVisible: Locator;
    readonly input_pw: Locator;
    readonly button_close_pwreset: Locator;
    
    constructor(page){
        this.page = page;  
        this.text_h2_BenutzerBearbeiten = page.getByTestId('layout-card-headline');
        this.button_pwChange = page.getByTestId('open-password-reset-dialog-icon');     
        this.button_pwReset = page.getByTestId('password-reset-button');
        this.text_pwResetInfo = page.getByTestId('password-reset-info-text');
        this.icon_pwVisible = page.getByTestId('show-password-icon');
        this.input_pw = page.locator('[data-testid="password-output-field"] input'); 
        this.button_close_pwreset = page.getByTestId('close-password-reset-dialog-button');
    }
}