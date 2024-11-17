import { type Locator, Page } from '@playwright/test';
import { FooterDataTablePage } from '../FooterDataTable.page';

export class KlasseManagementViewPage{
    readonly page: Page;
    readonly text_h1_Administrationsbereich: Locator;
    readonly text_h2_Klassenverwaltung: Locator;
    readonly combobox_Filter_Schule: Locator;
    readonly combobox_Filter_Klasse: Locator;
    readonly table_header_Dienststellennummer: Locator;
    readonly table_header_Klassenname: Locator;
    readonly icon_KlasseLoeschen: Locator;
    readonly button_KlasseLoeschen: Locator;
    readonly button_SchliesseKlasseLoeschenDialog: Locator;
    readonly tableRows: Locator;
    readonly footerDataTable: FooterDataTablePage;
   
    constructor(page){
        this.page = page;  
        this.text_h1_Administrationsbereich = page.getByTestId('admin-headline');
        this.text_h2_Klassenverwaltung = page.getByTestId('layout-card-headline');
        this.combobox_Filter_Schule = page.getByPlaceholder('Schule');
        this.combobox_Filter_Klasse = page.getByPlaceholder('Klasse');
        this.table_header_Dienststellennummer = page.getByText('Dienststellennummer');
        this.table_header_Klassenname = page.getByTestId('klasse-table').getByText('Klasse', { exact: true });
        this.icon_KlasseLoeschen = page.getByTestId('open-klasse-delete-dialog-icon');
        this.button_KlasseLoeschen = page.getByTestId('klasse-delete-button');
        this.button_SchliesseKlasseLoeschenDialog = page.getByTestId('close-klasse-delete-success-dialog-button');
        this.tableRows = page.locator('table >> tbody >> tr');
        this.footerDataTable = new FooterDataTablePage(page);
    }
}