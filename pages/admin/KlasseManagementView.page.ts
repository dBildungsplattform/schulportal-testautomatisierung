import { expect, type Locator, Page } from '@playwright/test';
import { FooterDataTablePage } from '../FooterDataTable.page';
import { ComboBox } from '../../elements/ComboBox';
import { KlasseDetailsViewPage } from './KlasseDetailsView.page';

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
    readonly comboboxOrganisationInput: ComboBox;
    readonly organisationInput: Locator;
    readonly textAlertDeleteKlasse: Locator;
    readonly buttonCloseAlert: Locator;
    readonly iconTableRowDelete: (className: string) => Locator;
   
    constructor(page: Page){
        this.page = page;  
        this.textH1Administrationsbereich = page.getByTestId('admin-headline');
        this.textH2Klassenverwaltung = page.getByTestId('layout-card-headline');
        this.comboboxFilterSchule = page.getByPlaceholder('Schule');
        this.comboboxFilterKlasse = page.getByPlaceholder('Klasse');
        this.tableHeaderDienststellennummer = page.getByText('Dienststellennummer');
        this.tableHeaderKlassenname = page.getByTestId('klasse-table').getByText('Klasse', { exact: true });
        this.buttonKlasseLoeschen = page.getByTestId('klasse-delete-button');
        this.buttonSchliesseKlasseLoeschenDialog = page.getByTestId('close-klasse-delete-success-dialog-button');
        this.tableRows = page.locator('table >> tbody >> tr');
        this.footerDataTable = new FooterDataTablePage(page);
        this.organisationInput = page.getByTestId('schule-select').locator('input');
        this.comboboxOrganisationInput = new ComboBox(this.page, this.organisationInput);
        this.textAlertDeleteKlasse = page.getByTestId('alert-text');
        this.buttonCloseAlert = page.getByTestId('alert-button');
        this.iconTableRowDelete = (className: string) => page.getByRole('row', { name: className }).getByTestId('open-klasse-delete-dialog-icon');
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

    public async waitErgebnislisteIsLoaded() {
        await this.page.waitForResponse(resp => resp.url().includes('/api/organisationen') && resp.status() === 200);
        await expect(this.textH2Klassenverwaltung).toHaveText("Klassenverwaltung");
    }

    public async filterSchule(schule: string) {
        await this.comboboxOrganisationInput.searchByTitle(schule, false);
    }

    public async checkRowExists(className: string) {
        await expect(this.page.getByRole('cell', { name: className })).toBeVisible();
    }

    public async checkRowNotExists(className: string) {
        await expect(this.page.getByRole('cell', { name: className })).toBeHidden();
    }

    public async deleteRowViaQuickAction(className: string) {
        this.clickIconTableRowLoeschen(className)
        await this.clickButtonLoeschen();
        await this.buttonSchliesseKlasseLoeschenDialog.click();
    }

    public async checkDeleteClassFailed() {
        await expect(this.textAlertDeleteKlasse).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    }

    public async clickButtonCloseAlert() {
        await this.buttonCloseAlert.click();
    }

    public async clickButtonLoeschen() {
        await this.buttonKlasseLoeschen.click();
    }

    public async openDetailViewClass(className: string) {
        await this.page.getByRole('cell', { name: className }).click()
        return new KlasseDetailsViewPage(this.page);
    }

    public async clickIconTableRowLoeschen(className: string) {
        await this.iconTableRowDelete(className).click();
    }
}