import { expect, Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { DataTable } from '../../../components/DataTable.neu.page';
import { KlasseDetailsViewPage } from './details/KlasseDetailsView.neu.page';
import { SearchFilter } from '../../../../elements/SearchFilter';
import { KlasseCreationParams } from './KlasseCreationView.neu.page';
import { waitForAPIResponse } from '../../../../base/api/baseApi';

export class KlasseManagementViewPage {
  /* add global locators here */
  private readonly klasseTable: DataTable;
  private readonly searchFilter: SearchFilter;
  private readonly table: Locator;
  private readonly klasseSelect: Locator;

  constructor(protected readonly page: Page) {
    this.table = this.page.getByTestId('klasse-table');
    this.klasseTable = new DataTable(this.page, this.table);
    this.searchFilter = new SearchFilter(this.page);
    this.klasseSelect = this.page.getByTestId('klassen-management-klasse-select');
  }

  /* actions */
  public async waitForPageLoad(): Promise<KlasseManagementViewPage> {
    await expect(this.page.getByTestId('klasse-management-headline')).toHaveText('Klassenverwaltung');
    return this;
  }

  public async waitForDataLoad(): Promise<KlasseManagementViewPage> {
    await waitForAPIResponse(this.page, 'organisationen');
    await this.klasseTable.waitForDataLoad();
    return this;
  }

  public async setItemsPerPage(entries: 5 | 30 | 50 | 100 | 300): Promise<void> {
    await this.klasseTable.setItemsPerPage(entries);
  }
    
  private async filterByText(text: string, testId: string, exact: boolean = false): Promise<void> {
    const filter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId(testId));
    await filter.searchByTitle(text, exact);
  }

  public async filterBySchule(schulname: string, exact: boolean = false): Promise<void> {
    await this.filterByText(schulname, 'klassen-management-schule-select', exact);
  }

  public async filterByKlasse(klassenname: string): Promise<void> {
    const filter: Autocomplete = new Autocomplete(this.page, this.klasseSelect);
    await filter.searchByTitle(klassenname, false);
  }

  public async clickColumnHeader(columnName: string): Promise<void> {
    await this.klasseTable.clickColumnHeader(columnName, 'organisationen');
  }

  public async toggleKlasseSort(): Promise<void> {
    await this.klasseTable.clickColumnHeader('Klasse', 'organisationen');
  }

  public async goToFirstPage(): Promise<void> {
    await this.klasseTable.goToFirstPage();
    
  }

  public async goToLastPage(): Promise<void> {
    await this.klasseTable.goToLastPage();
  }

  public async hasMultiplePages(): Promise<boolean> {
    return await this.klasseTable.hasMultiplePages();
  }
  
  public async openGesamtuebersicht(klassenname: string): Promise<KlasseDetailsViewPage> {
    await this.klasseTable.getRow(klassenname).click();
    const klasseDetailsViewPage: KlasseDetailsViewPage = new KlasseDetailsViewPage(this.page);
    await klasseDetailsViewPage.waitForPageLoad();
    return klasseDetailsViewPage;
  }
  
  public async searchAndOpenGesamtuebersicht(hasMultipleSchulen: boolean, klasseParams: KlasseCreationParams): Promise<KlasseDetailsViewPage> {
    if (hasMultipleSchulen) {
      await this.filterBySchule(klasseParams.schulname);
    } else {
      await this.checkIfSchuleIsCorrect(klasseParams.schulname, klasseParams.schulNr);
    }
    await this.filterByKlasse(klasseParams.klassenname);
    await this.checkIfKlasseExists(klasseParams.klassenname);

    return this.openGesamtuebersicht(klasseParams.klassenname);
  }

  public async searchAndDeleteKlasse(hasMultipleSchulen: boolean, klasseParams: KlasseCreationParams): Promise<void> {
    if (hasMultipleSchulen) {
      await this.filterBySchule(klasseParams.schulname);
    } else {
      await this.checkIfSchuleIsCorrect(klasseParams.schulname, klasseParams.schulNr);
    }
    await this.filterByKlasse(klasseParams.klassenname);
    await this.checkIfKlasseExists(klasseParams.klassenname);

    await this.page.getByTestId('open-klasse-delete-dialog-icon').click();
    await expect(this.page.getByTestId('klasse-delete-confirmation-text')).toHaveText(`Wollen Sie die Klasse ${klasseParams.klassenname} an der Schule ${klasseParams.schulNr} (${klasseParams.schulname}) wirklich entfernen?`);
    await this.page.getByTestId('klasse-delete-button').click();
  }

  /* assertions */
  public async checkManagementPage(hasMultipleSchulen: boolean): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('klasse-management-headline')).toHaveText('Klassenverwaltung');
    await expect(this.page.getByTestId('klassen-management-schule-select')).toBeVisible();
    await expect(this.page.getByTestId('klassen-management-klasse-select')).toBeVisible();
    const expectedHeaders: string[] = hasMultipleSchulen ? ['Dienststellennummer', 'Klasse', 'Aktion'] : ['Klasse', 'Aktion'];
    await this.checkHeaders(expectedHeaders);
  }

  public async checkIfTableIsLoaded(rowCount: number, expectedHeaders: string[]): Promise<void> {
    await this.klasseTable.checkRowCount(rowCount);
    await this.klasseTable.checkHeaders(expectedHeaders);
  }

  public async checkAllDropdownOptionsVisible(klassen: string[]): Promise<void> {
    await this.klasseTable.checkVisibleDropdownOptions(
      klassen,
      this.klasseSelect,
      true,
      `${klassen.length} Klassen gefunden`
    );
  }

  public async checkAllDropdownOptionsClickable(klassen: string[]): Promise<void> {
    await this.klasseTable.checkAllDropdownOptionsClickable(klassen, this.klasseSelect);
  }

  public async checkHeaders(expectedHeaders: string[]): Promise<void> {
    await this.klasseTable.checkHeaders(expectedHeaders);
  }

  public async checkRows(rowCount: number): Promise<void> {
    await this.klasseTable.checkRowCount(rowCount);
  }

  public async checkIfSchuleIsCorrect(schulname: string,  schulNr: string): Promise<void> {
    await expect(this.page.getByTestId('klassen-management-schule-select')).toHaveText(schulNr + ' (' + schulname + ')');
  }

  public async checkIfKlasseExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsVisible(klassenname);
  }

  public async checkIfKlasseNotExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsNotVisible(klassenname);
  }

  public async checkTableData(hasMultipleSchulen: boolean): Promise<void> {
    await this.klasseTable.checkTableData((row: Locator) => this.checkTableRow(row, hasMultipleSchulen));
  }

  private async checkTableRow(row: Locator, hasMultipleSchulen: boolean): Promise<void> {
    const cells: Locator = row.locator('td');
    
    const klassennameCell: Locator = cells.nth(hasMultipleSchulen ? 2 : 1);
    await expect(klassennameCell).toBeVisible();
    await expect(klassennameCell).not.toBeEmpty();

    if (!hasMultipleSchulen) return;
    const dienststellennummerCell: Locator = cells.nth(1);
    await expect(dienststellennummerCell).toBeVisible();
    await expect(dienststellennummerCell).toHaveText(/\S{1,255} \(\S{1,255}\)/);
  } 

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string, schulNr: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-delete-success-text')).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulNr} (${schulname}) wurde erfolgreich gelöscht.`);
    await this.page.getByTestId('close-klasse-delete-success-dialog-button').click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    await expect(this.page.getByTestId('klasse-management-error-alert-text')).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await this.page.getByTestId('klasse-management-error-alert-button').click();
  }

  public async checkIfColumnHeaderSorted(columnName: string, sortingStatus: 'ascending' | 'descending' | 'not-sortable'): Promise<void> {
    await this.klasseTable.checkIfColumnHeaderSorted(columnName, sortingStatus);
  }

  public async checkIfColumnDataSorted(hasMultipleSchulen: boolean, sortOrder: 'ascending' | 'descending'): Promise<void> {
    const cellIndex: number = hasMultipleSchulen ? 2 : 1;

    await this.checkIfColumnHeaderSorted('Klasse', sortOrder);
    await this.klasseTable.checkIfColumnDataSorted(cellIndex, sortOrder);
  }
}
