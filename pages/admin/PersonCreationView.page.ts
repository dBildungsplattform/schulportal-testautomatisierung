import { type Locator, Page } from '@playwright/test';

export class PersonCreationViewPage{
    readonly page: Page;
    readonly text_h2_PersonAnlegen: Locator;
    readonly combobox_Rolle: Locator;
    readonly combobox_Rolle_Clear: Locator;
    readonly Input_Vorname: Locator;
    readonly Input_Nachname: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly combobox_Klasse: Locator;
    readonly button_PersonAnlegen: Locator;
    readonly text_success: Locator;
    readonly text_Bestaetigungsseite_Benutzername: Locator;
    readonly text_Bestaetigungsseite_Benutzernachname: Locator;
    readonly text_Bestaetigungsseite_Rolle: Locator;
    readonly input_EinstiegsPasswort: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h2_PersonAnlegen = page.getByTestId('layout-card-headline');
        this.combobox_Rolle = page.getByTestId('rolle-select').locator('.v-field__input');
        this.combobox_Rolle_Clear = page.getByTestId('rolle-select').getByLabel('Clear');
        this.Input_Vorname = page.getByTestId('vorname-input').locator('.v-field__input');
        this.Input_Nachname = page.getByTestId('familienname-input').locator('.v-field__input');
        this.combobox_Schulstrukturknoten = page.getByTestId('organisation-select').locator('.v-field__input');
        this.combobox_Klasse = page.getByTestId('klasse-select').locator('.v-field__input');
        this.button_PersonAnlegen = page.getByTestId('person-creation-form-create-button');
        this.text_success = page.getByTestId('person-success-text');
        this.text_Bestaetigungsseite_Benutzername =  page.getByTestId('created-person-username');
        this.text_Bestaetigungsseite_Rolle = page.getByTestId('created-person-rolle');
        this.input_EinstiegsPasswort = page.locator('[data-testid="password-output-field"] input'); 
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
    }
}