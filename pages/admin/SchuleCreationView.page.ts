import { type Locator, Page } from '@playwright/test';

export class SchuleCreationViewPage{
    readonly page: Page;
    readonly text_h2_SchuleAnlegen: Locator;
    readonly button_Schliessen: Locator;
    readonly radio_button_Public_Schule: Locator;
    readonly input_Dienststellennummer: Locator;
    readonly input_Schulname: Locator;
    readonly button_SchuleAnlegen: Locator;
    readonly button_WeitereSchuleAnlegen: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_DatenGespeichert: Locator;
    readonly label_Schulform: Locator;
    readonly data_Schulform: Locator;
    readonly label_Dienststellennummer: Locator;
    readonly data_Dienststellennummer: Locator;
    readonly label_Schulname: Locator;
    readonly data_Schulname: Locator;

    constructor(page){
        // Anlage Schule
        this.page = page;
        this.text_h2_SchuleAnlegen = page.getByTestId('layout-card-headline');
        this.button_Schliessen = page.getByTestId('close-layout-card-button');
        this.radio_button_Public_Schule = page.getByTestId('schulform-radio-button-0');
        this.input_Dienststellennummer = page.getByTestId('dienststellennummer-input').locator('input');
        this.input_Schulname = page.getByTestId('schulname-input').locator('input');
        this.button_SchuleAnlegen = page.getByTestId('schule-creation-form-create-button');
        this.button_WeitereSchuleAnlegen = page.getByTestId('create-another-schule-button');
        // Bestätigungsseite
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.text_success = page.getByTestId('schule-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_Schulform =  page.getByText('Schulform:', { exact: true });
        this.data_Schulform =  page.getByTestId('created-schule-form');
        this.label_Dienststellennummer =  page.getByText('Dienststellennummer:', { exact: true });
        this.data_Dienststellennummer =  page.getByTestId('created-schule-dienststellennummer');
        this.label_Schulname =  page.getByText('Schulname:', { exact: true });
        this.data_Schulname =  page.getByTestId('created-schule-name');
    }
}