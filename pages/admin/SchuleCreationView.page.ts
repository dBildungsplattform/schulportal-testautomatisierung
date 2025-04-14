import { type Locator, Page } from '@playwright/test';

export class SchuleCreationViewPage{
    readonly page: Page;
    readonly textH2SchuleAnlegen: Locator;
    readonly buttonSchliessen: Locator;
    readonly radioButtonPublicSchule: Locator;
    readonly inputDienststellennummer: Locator;
    readonly inputSchulname: Locator;
    readonly buttonSchuleAnlegen: Locator;
    readonly buttonWeitereSchuleAnlegen: Locator;
    readonly buttonZurueckErgebnisliste: Locator;
    readonly textSuccess: Locator;
    readonly iconSuccess: Locator;
    readonly textDatenGespeichert: Locator;
    readonly labelSchulform: Locator;
    readonly dataSchulform: Locator;
    readonly labelDienststellennummer: Locator;
    readonly dataDienststellennummer: Locator;
    readonly labelSchulname: Locator;
    readonly dataSchulname: Locator;

    constructor(page: Page){
        // Anlage Schule
        this.page = page;
        this.textH2SchuleAnlegen = page.getByTestId('layout-card-headline');
        this.buttonSchliessen = page.getByTestId('close-layout-card-button');
        this.radioButtonPublicSchule = page.getByTestId('schulform-radio-button-0');
        this.inputDienststellennummer = page.getByTestId('dienststellennummer-input').locator('input');
        this.inputSchulname = page.getByTestId('schulname-input').locator('input');
        this.buttonSchuleAnlegen = page.getByTestId('schule-creation-form-submit-button');
        this.buttonWeitereSchuleAnlegen = page.getByTestId('create-another-schule-button');
        // Bestätigungsseite
        this.buttonZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.textSuccess = page.getByTestId('schule-success-text');
        this.iconSuccess = page.locator('.mdi-check-circle');
        this.textDatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.labelSchulform =  page.getByText('Schulform:', { exact: true });
        this.dataSchulform =  page.getByTestId('created-schule-form');
        this.labelDienststellennummer =  page.getByText('Dienststellennummer:', { exact: true });
        this.dataDienststellennummer =  page.getByTestId('created-schule-dienststellennummer');
        this.labelSchulname =  page.getByText('Schulname:', { exact: true });
        this.dataSchulname =  page.getByTestId('created-schule-name');
    }
}