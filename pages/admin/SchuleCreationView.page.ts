import { type Locator, Page } from '@playwright/test';

export class SchuleCreationViewPage{
    readonly page: Page;
    readonly text_h2_SchuleAnlegen: Locator;
    readonly radio_button_Public_Schule: Locator;
    readonly radio_button_Ersatzschule: Locator;
    readonly input_Dienststellennummer: Locator;
    readonly input_Schulname: Locator;
    readonly button_SchuleAnlegen: Locator;
    readonly button_WeitereSchuleAnlegen: Locator;
    readonly text_success: Locator;
   
    constructor(page){
        this.page = page;
        this.text_h2_SchuleAnlegen = page.getByTestId('layout-card-headline');
        this.radio_button_Public_Schule = page.getByTestId('public-schule-radio-button');
        this.radio_button_Ersatzschule = page.getByTestId('ersatzschule-radio-button');
        this.input_Dienststellennummer = page.getByTestId('dienststellennummer-input').locator('input');
        this.input_Schulname = page.getByTestId('schulname-input').locator('input');
        this.button_SchuleAnlegen = page.getByTestId('schule-creation-form-create-button');
        this.button_WeitereSchuleAnlegen = page.getByTestId('create-another-schule-button');
        this.text_success = page.getByTestId('schule-success-text');
    }
}