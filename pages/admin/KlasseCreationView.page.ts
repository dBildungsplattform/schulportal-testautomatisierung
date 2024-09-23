import { type Locator, Page } from '@playwright/test';

export class KlasseCreationViewPage{
    readonly page: Page;
    readonly text_h2_klasseAnlegen: Locator;
    readonly button_schliessen: Locator;
    readonly combobox_schulstrukturknoten: Locator;
    readonly input_klassenname: Locator;
    readonly button_klasseAnlegen: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_datenGespeichert: Locator;
    readonly label_schule: Locator;
    readonly data_schule: Locator;
    readonly label_klasse: Locator;
    readonly data_klasse: Locator;
    readonly button_zurueckErgebnisliste: Locator;
    readonly button_weitereKlasseAnlegen: Locator;
   
    constructor(page){
        // Anlage Klasse
        this.page = page;
        this.text_h2_klasseAnlegen = page.getByTestId('layout-card-headline');
        this.button_schliessen = page.getByTestId('close-layout-card-button');
        this.combobox_schulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control'); 
        this.input_klassenname = page.getByTestId('klassenname-input').locator('input');
        this.button_klasseAnlegen = page.getByTestId('klasse-form-create-button');
        // Bestätigungsseite Klasse
        this.text_success = page.getByTestId('klasse-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_datenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_schule =  page.getByText('Schule:', { exact: true });
        this.data_schule =  page.getByTestId('created-klasse-schule');
        this.label_klasse =  page.getByText('Klassenname:', { exact: true });
        this.data_klasse =  page.getByTestId('created-klasse-name');
        this.button_zurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.button_weitereKlasseAnlegen = page.getByTestId('create-another-klasse-button');
    }
}