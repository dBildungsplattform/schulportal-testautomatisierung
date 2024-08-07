import { type Locator, Page } from '@playwright/test';

export class PersonCreationViewPage{
    readonly page: Page;
    readonly body: Locator;
    readonly text_h2_PersonAnlegen: Locator;
    readonly button_Schliessen: Locator;
    readonly combobox_Rolle: Locator;
    readonly combobox_Rolle_Clear: Locator;
    readonly Input_Vorname: Locator;
    readonly Input_Nachname: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly combobox_Schulstrukturknoten_Clear: Locator;
    readonly combobox_Klasse: Locator;
    readonly button_PersonAnlegen: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_DatenGespeichert: Locator;
    readonly text_Bestaetigungsseite_Benutzernachname: Locator;
    readonly input_EinstiegsPasswort: Locator;
    readonly label_EinstiegsPasswort: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
    readonly button_WeiterenBenutzerAnlegen: Locator;
    readonly label_Vorname: Locator;
    readonly data_Vorname: Locator;
    readonly label_Nachname: Locator;
    readonly data_Nachname: Locator;
    readonly label_Benutzername: Locator;
    readonly data_Benutzername: Locator;
    readonly label_Rolle: Locator;
    readonly data_Rolle: Locator;
    readonly label_Organisationsebene: Locator;
    readonly data_Organisationsebene: Locator;
    readonly label_Klasse: Locator;
    readonly data_Klasse: Locator;
   
    constructor(page){
        // Anlage Person
        this.page = page;  
        this.body = page.locator('body');
        this.text_h2_PersonAnlegen = page.getByTestId('layout-card-headline');
        this.button_Schliessen = page.getByTestId('close-layout-card-button');
        this.combobox_Rolle = page.getByTestId('rolle-select').locator('.v-field__input');
        this.combobox_Rolle_Clear = page.getByTestId('rolle-select').getByLabel('leeren');
        this.combobox_Schulstrukturknoten_Clear = page.getByTestId('organisation-select').getByLabel('leeren');
        this.Input_Vorname = page.getByTestId('vorname-input').locator('.v-field__input');
        this.Input_Nachname = page.getByTestId('familienname-input').locator('.v-field__input');
        this.combobox_Schulstrukturknoten = page.getByTestId('organisation-select').locator('.v-field__input');
        this.combobox_Klasse = page.getByTestId('klasse-select').locator('.v-field__input');
        this.button_PersonAnlegen = page.getByTestId('person-creation-form-create-button');
        // Bestätigungsseite Klasse
        this.text_success = page.getByTestId('person-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_Vorname =  page.getByText('Vorname:', { exact: true });
        this.data_Vorname =  page.getByTestId('created-person-vorname');
        this.label_Nachname =  page.getByText('Nachname:', { exact: true });
        this.data_Nachname =  page.getByTestId('created-person-familienname');
        this.label_Benutzername =  page.getByText('Benutzername:', { exact: true });
        this.data_Benutzername = page.getByTestId('created-person-username');
        this.label_Rolle =  page.getByText('Rolle:', { exact: true });
        this.data_Rolle = page.getByTestId('created-person-rolle');
        this.label_Organisationsebene = page.getByText('Organisationsebene:', { exact: true });
        this.data_Organisationsebene =  page.getByTestId('created-person-organisation');
        this.label_Klasse =  page.getByText('Klasse:'), { exact: true };
        this.data_Klasse =  page.getByTestId('created-klasse-name');
        this.label_EinstiegsPasswort =  page.getByText(' Einstiegs-Passwort:'), { exact: true };
        this.input_EinstiegsPasswort = page.locator('[data-testid="password-output-field"] input'); 
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.button_WeiterenBenutzerAnlegen = page.getByTestId('create-another-person-button');
    }
}