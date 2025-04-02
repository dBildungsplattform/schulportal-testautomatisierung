import { type Locator, Page } from '@playwright/test';
import { ComboBox } from '../../elements/ComboBox';

export class KlasseCreationViewPage{
    readonly page: Page;
    readonly textH2KlasseAnlegen: Locator;
    readonly buttonSchliessen: Locator;
    readonly comboboxSchulstrukturknoten: Locator;
    readonly inputKlassenname: Locator;
    readonly buttonKlasseAnlegen: Locator;
    readonly textSuccess: Locator;
    readonly iconSuccess: Locator;
    readonly textDatenGespeichert: Locator;
    readonly labelSchule: Locator;
    readonly dataSchule: Locator;
    readonly labelKlasse: Locator;
    readonly dataKlasse: Locator;
    readonly buttonZurueckErgebnisliste: Locator;
    readonly buttonWeitereKlasseAnlegen: Locator;
    readonly comboboxOrganisationInput: ComboBox;
    readonly organisation: Locator;
    readonly organisationInput: Locator;
   
    constructor(page){
        // Anlage Klasse
        this.page = page;
        this.textH2KlasseAnlegen = page.getByTestId('layout-card-headline');
        this.buttonSchliessen = page.getByTestId('close-layout-card-button');
        this.comboboxSchulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control');
        this.organisation = page.getByTestId('schule-select').locator('.v-field');
        this.organisationInput = page.getByTestId('schule-select').locator('input');
        this.inputKlassenname = page.getByTestId('klassenname-input').locator('input');
        this.buttonKlasseAnlegen = page.getByTestId('klasse-form-submit-button');
        // Bestätigungsseite Klasse
        this.textSuccess = page.getByTestId('klasse-success-text');
        this.iconSuccess = page.locator('.mdi-check-circle');
        this.textDatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.labelSchule =  page.getByText('Schule:', { exact: true });
        this.dataSchule =  page.getByTestId('created-klasse-schule');
        this.labelKlasse =  page.getByText('Klassenname:', { exact: true });
        this.dataKlasse =  page.getByTestId('created-klasse-name');
        this.buttonZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.buttonWeitereKlasseAnlegen = page.getByTestId('create-another-klasse-button');
        this.comboboxOrganisationInput = new ComboBox(this.page, page.getByTestId('schule-select'));
    }

    public async waitForFilterToLoad(): Promise<void> {
        return this.comboboxOrganisationInput.waitUntilLoadingIsDone()
    }
}