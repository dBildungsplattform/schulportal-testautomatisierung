import { type Locator, Page } from '@playwright/test';

export class RolleCreationViewPage{
    readonly page: Page;
    readonly text_h2_RolleAnlegen: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly combobox_Rollenart: Locator;
    readonly input_Rollenname: Locator;
    readonly combobox_Merkmal: Locator;
    readonly button_RolleAnlegen: Locator;
    readonly button_WeitereRolleAnlegen: Locator;
    readonly text_success: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h2_RolleAnlegen = page.getByTestId('layout-card-headline');
        this.combobox_Schulstrukturknoten = page.getByTestId('administrationsebene-select').locator('.v-input__control');
        this.combobox_Rollenart = page.getByTestId('rollenart-select').locator('.v-input__control');
        this.input_Rollenname = page.getByTestId('rollenname-input').locator('input');
        this.combobox_Merkmal = page.getByTestId('merkmale-select').locator('.v-input__control');
        this.button_RolleAnlegen = page.getByTestId('rolle-creation-form-create-button');
        this.button_WeitereRolleAnlegen = page.getByTestId('create-another-rolle-button');
        this.text_success = page.getByText('Die Rolle wurde erfolgreich hinzugefügt.');
    }
}