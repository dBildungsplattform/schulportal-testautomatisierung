import { type Locator, Page } from '@playwright/test';

export class KlasseCreationViewPage{
    readonly page: Page;
    readonly text_h2_KlasseAnlegen: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly input_Klassenname: Locator;
    readonly button_KlasseAnlegen: Locator;
    readonly text_success: Locator;
   
    constructor(page){
        this.page = page;
        this.text_h2_KlasseAnlegen = page.getByTestId('layout-card-headline');
        this.combobox_Schulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control'); 
        this.input_Klassenname = page.getByTestId('klassenname-input').locator('input');
        this.button_KlasseAnlegen = page.getByTestId('klasse-form-create-button');
        this.text_success = page.getByTestId('klasse-success-text');
    }
}