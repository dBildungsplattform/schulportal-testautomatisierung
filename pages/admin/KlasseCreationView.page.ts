import { type Locator, Page } from '@playwright/test';

export class KlasseCreationViewPage{
    readonly page: Page;
    readonly text_h2_KlasseAnlegen: Locator;
    readonly button_Schliessen: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly input_Klassenname: Locator;
    readonly button_KlasseAnlegen: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_DatenGespeichert: Locator;
    readonly label_Schule: Locator;
    readonly data_Schule: Locator;
    readonly label_Klasse: Locator;
    readonly data_Klasse: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
    readonly button_WeitereKlasseAnlegen: Locator;
   
    constructor(page){
        // Anlage Klasse
        this.page = page;
        this.text_h2_KlasseAnlegen = page.getByTestId('layout-card-headline');
        this.button_Schliessen = page.getByTestId('close-layout-card-button');
        this.combobox_Schulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control'); 
        this.input_Klassenname = page.getByTestId('klassenname-input').locator('input');
        this.button_KlasseAnlegen = page.getByTestId('klasse-creation-form-create-button');
        // Bestätigungsseite Klasse
        this.text_success = page.getByTestId('klasse-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_Schule =  page.getByText('Schule:', { exact: true });
        this.data_Schule =  page.getByTestId('created-klasse-schule');
        this.label_Klasse =  page.getByText('Klassenname:'), { exact: true };
        this.data_Klasse =  page.getByTestId('created-klasse-name');
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.button_WeitereKlasseAnlegen = page.getByTestId('create-another-klasse-button');
    }
}