import { type Locator, Page } from '@playwright/test';

export class RolleCreationViewPage{
    readonly page: Page;
    readonly text_h2_RolleAnlegen: Locator;
    readonly button_Schliessen: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly combobox_Rollenart: Locator;
    readonly input_Rollenname: Locator;
    readonly combobox_Merkmal: Locator;
    readonly combobox_Angebote: Locator;
    readonly combobox_Systemrechte: Locator;
    readonly button_RolleAnlegen: Locator;
    readonly button_WeitereRolleAnlegen: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_DatenGespeichert: Locator;
    readonly label_Administrationsebene: Locator;
    readonly data_Administrationsebene: Locator;
    readonly label_Rollenart: Locator;
    readonly data_Rollenart: Locator;
    readonly label_Rollenname: Locator;
    readonly data_Rollenname: Locator;
    readonly label_Merkmale: Locator;
    readonly data_Merkmale: Locator;
    readonly label_Angebote: Locator;
    readonly data_Angebote: Locator;
    readonly label_Systemrechte: Locator;
    readonly data_Systemrechte: Locator;
   
    constructor(page){
        // Anlage Rolle
        this.page = page;
        this.text_h2_RolleAnlegen = page.getByTestId('layout-card-headline');
        this.button_Schliessen = page.getByTestId('close-layout-card-button');
        this.combobox_Schulstrukturknoten = page.getByTestId('administrationsebene-select').locator('.v-input__control');
        this.combobox_Rollenart = page.getByTestId('rollenart-select').locator('.v-input__control');
        this.input_Rollenname = page.getByTestId('rollenname-input').locator('input');
        this.combobox_Merkmal = page.getByTestId('merkmale-select').locator('.v-input__control');
        this.combobox_Angebote = page.getByTestId('service-provider-select').locator('.v-input__control');
        this.combobox_Systemrechte = page.getByTestId('systemrechte-select').locator('.v-input__control');
        this.button_RolleAnlegen = page.getByTestId('rolle-form-create-button');
        this.button_WeitereRolleAnlegen = page.getByTestId('create-another-rolle-button');
        // Bestätigungsseite Rolle
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.text_success = page.getByTestId('rolle-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_Administrationsebene =  page.getByText('Administrationsebene:', { exact: true });
        this.data_Administrationsebene =  page.getByTestId('created-rolle-administrationsebene');
        this.label_Rollenart =  page.getByText('Rollenart:', { exact: true });
        this.data_Rollenart =  page.getByTestId('created-rolle-rollenart');
        this.label_Rollenname =  page.getByText('Rollenname:', { exact: true });
        this.data_Rollenname =  page.getByTestId('created-rolle-name');
        this.label_Merkmale =  page.getByText('Merkmale:', { exact: true });
        this.data_Merkmale =  page.getByTestId('created-rolle-merkmale');
        this.label_Angebote =  page.getByText('Zugeordnete Angebote:', { exact: true });
        this.data_Angebote =  page.getByTestId('created-rolle-angebote');
        this.label_Systemrechte =  page.getByText('Systemrechte:', { exact: true });
        this.data_Systemrechte =  page.getByTestId('created-rolle-systemrecht');
    }
}