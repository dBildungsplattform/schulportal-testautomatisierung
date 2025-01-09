import { expect, type Locator, Page } from '@playwright/test';
import { FooterDataTablePage } from '../FooterDataTable.page';

export class KlasseManagementViewPage{
    readonly page: Page;
    readonly textH1Administrationsbereich: Locator;
    readonly textH2Klassenverwaltung: Locator;
    readonly comboboxFilterSchule: Locator;
    readonly comboboxFilterKlasse: Locator;
    readonly tableHeaderDienststellennummer: Locator;
    readonly tableHeaderKlassenname: Locator;
    readonly iconKlasseLoeschen: Locator;
    readonly buttonKlasseLoeschen: Locator;
    readonly buttonSchliesseKlasseLoeschenDialog: Locator;
    readonly tableRows: Locator;
    readonly footerDataTable: FooterDataTablePage;
   
    constructor(page: Page){
        this.page = page;  
        this.textH1Administrationsbereich = page.getByTestId('admin-headline');
        this.textH2Klassenverwaltung = page.getByTestId('layout-card-headline');
        this.comboboxFilterSchule = page.getByPlaceholder('Schule');
        this.comboboxFilterKlasse = page.getByPlaceholder('Klasse');
        this.tableHeaderDienststellennummer = page.getByText('Dienststellennummer');
        this.tableHeaderKlassenname = page.getByTestId('klasse-table').getByText('Klasse', { exact: true });
        this.iconKlasseLoeschen = page.getByTestId('open-klasse-delete-dialog-icon');
        this.buttonKlasseLoeschen = page.getByTestId('klasse-delete-button');
        this.buttonSchliesseKlasseLoeschenDialog = page.getByTestId('close-klasse-delete-success-dialog-button');
        this.tableRows = page.locator('table >> tbody >> tr');
        this.footerDataTable = new FooterDataTablePage(page);
    }

    // Loops through the Data in the table and checks if the Dienstellennummer and Klassenname are not empty
    public async checkTableData() {
        const tableRowsCount = await this.tableRows.count();
        for (let i = 0; i < tableRowsCount; i++) {
            const dienststellennummerCell =  this.tableRows.nth(i).locator('td').nth(0);
            const klassennameCell =  this.tableRows.nth(i).locator('td').nth(1);
    
            await expect(dienststellennummerCell).toBeVisible();
            await expect(dienststellennummerCell).not.toHaveText('---');
            await expect(klassennameCell).toBeVisible();
            await expect(klassennameCell).not.toBeEmpty();
          }
    }
}