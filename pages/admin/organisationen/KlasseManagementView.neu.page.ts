import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { DataTable } from '../../components/DataTable.neu.page';
import { KlasseDetailsViewPage } from './KlasseDetailsView.neu.page';
import { AbstractManagementViewPage } from '../../abstracts/AbstractManagementView.page';
import { SearchFilter } from '../../../elements/SearchFilter';

export class KlasseManagementViewPage extends AbstractManagementViewPage {
  /* add global locators here */
  private readonly klasseTable: DataTable = new DataTable(this.page, this.page.getByTestId('klasse-table'));
  private readonly searchFilter: SearchFilter = new SearchFilter(this.page);

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('klasse-management-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klassenverwaltung');
    return expect(this.page.getByTestId('klasse-table')).not.toContainText('Keine Daten');
  }

  public async filterBySchule(schulname: string): Promise<void> {
    const schuleFilter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));

    await schuleFilter.searchByTitle(schulname, false);
  }

  public async filterByKlasse(klassenname: string): Promise<void> {
    const klasseFilter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('klasse-select'));

    await klasseFilter.searchByTitle(klassenname, false);
  }
  
  public async openGesamtuebersicht(klassenname: string): Promise<KlasseDetailsViewPage> {
    await this.klasseTable.getItemByText(klassenname).click();
    const klasseDetailsViewPage: KlasseDetailsViewPage = new KlasseDetailsViewPage(this.page);
    await klasseDetailsViewPage.waitForPageLoad();
    return klasseDetailsViewPage;
  }
  
  public async searchAndOpenGesamtuebersicht(klassenname: string): Promise<KlasseDetailsViewPage> {
    await this.searchFilter.searchByText(klassenname);
    return this.openGesamtuebersicht(klassenname);
  }

  public async searchAndDeleteKlasse(klassenname: string, schulname: string): Promise<void> {
    await this.searchFilter.searchByText(klassenname);

    await this.page.getByTestId('open-klasse-delete-dialog-icon').click();
    await expect(this.page.getByTestId('klasse-delete-confirmation-text')).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await this.page.getByTestId('klasse-delete-button').click();
  }

  /* assertions */
  public async checkIfTableIsLoaded(rowCount: number, expectedHeaders: string[]): Promise<void> {
    await this.klasseTable.checkRowCount(rowCount);
    await this.klasseTable.checkHeaders(expectedHeaders);
  }

  public async checkHeaders(expectedHeaders: string[]): Promise<void> {
    this.klasseTable.checkHeaders(expectedHeaders);
  }

  public async checkRows(rowCount: number): Promise<void> {
    this.klasseTable.checkRowCount(rowCount);
  }

  public async checkIfKlasseExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsVisible(klassenname);
  }

  public async checkIfKlasseNotExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsNotVisible(klassenname);
  }

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-delete-success-text')).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await this.page.getByTestId('close-klasse-delete-success-dialog-button').click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-error-alert-text')).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await this.page.getByTestId('klasse-details-error-alert-button').click();
  }
}
