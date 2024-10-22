import { type Locator, Page } from '@playwright/test';

export class PersonManagementViewPage{
    readonly page: Page;
    readonly text_h1_Administrationsbereich: Locator;
    readonly text_h2_Benutzerverwaltung: Locator;
    readonly input_Suchfeld: Locator;
    readonly button_Suchen: Locator;
    readonly table_header_Nachname: Locator;
    readonly table_header_Vorname: Locator;
    readonly table_header_Benutzername: Locator;
    readonly table_header_KopersNr: Locator;
    readonly table_header_Rolle: Locator;
    readonly table_header_Zuordnungen: Locator;
    readonly table_header_Klasse: Locator;
    readonly comboboxMenuIcon_Schule: Locator;
    readonly comboboxDown_Rolle: Locator;
    readonly comboboxDown_Klasse: Locator;
    readonly comboboxDown_Status: Locator;
   
    constructor(page){
        this.page = page;  
        this.text_h1_Administrationsbereich = page.getByTestId('admin-headline');
        this.text_h2_Benutzerverwaltung = page.getByTestId('layout-card-headline');
        this.input_Suchfeld = page.locator('[data-testid="search-filter-input"] input');
        this.button_Suchen = page.getByTestId('apply-search-filter-button');
        this.table_header_Nachname = page.getByTestId('person-table').getByText('Nachname', { exact: true });
        this.table_header_Vorname = page.getByTestId('person-table').getByText('Vorname', { exact: true });
        this.table_header_Benutzername = page.getByText('Benutzername', { exact: true });
        this.table_header_KopersNr = page.getByText('KoPers.-Nr.');
        this.table_header_Rolle = page.getByTestId('person-table').getByText('Rolle', { exact: true });
        this.table_header_Zuordnungen = page.getByText('Zuordnung(en)');
        this.table_header_Klasse =  page.getByTestId('person-table').getByText('Klasse', { exact: true });
        this.comboboxDown_Schule =  page.locator('[data-testid="schule-select"] .mdi-menu-down');
        this.comboboxDown_Rolle =  page.locator('[data-testid="rolle-select"] .mdi-menu-down');
        this.comboboxDown_Klasse =  page.locator('[data-testid="klasse-select"] .mdi-menu-down');
        this.comboboxDown_Status =  page.locator('[data-testid="status-select"] .mdi-menu-down');
  }
}