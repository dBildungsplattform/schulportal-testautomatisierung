import { expect, Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { SearchFilter } from '../../../elements/SearchFilter';
import { DataTable } from '../../components/DataTable.neu.page';
import { MenuBarPage } from '../../components/MenuBar.neu.page';
import { PersonDetailsViewPage } from './details/PersonDetailsView.neu.page';
import { UserInfo } from '../../../base/api/personApi';

export class PersonManagementViewPage {
  private readonly personTable: DataTable;
  private readonly searchFilter: SearchFilter;
  private readonly organisationAutocomplete: Autocomplete;
  private readonly rolleAutocomplete: Autocomplete;
  public readonly menu: MenuBarPage;
  private readonly table: Locator;
  private readonly dialogCard: Locator;

  constructor(protected readonly page: Page) {
    this.table = this.page.getByTestId('person-table');
    this.personTable = new DataTable(this.page, this.table);
    this.searchFilter = new SearchFilter(this.page);
    this.organisationAutocomplete = new Autocomplete(
      this.page,
      this.page.getByTestId('person-management-organisation-select')
    );
    this.rolleAutocomplete = new Autocomplete(
      this.page,
      this.page.getByTestId('rolle-select')
    );
    this.menu = new MenuBarPage(this.page);
    this.dialogCard = this.page.getByTestId('change-klasse-layout-card');
  }

  /* actions */
  public async waitForPageLoad(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('admin-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('person-management-headline')).toHaveText('Benutzerverwaltung');
    await expect(this.page.getByTestId('person-table')).not.toContainText('Keine Daten');
    return this;
  }

  public async waitForDataLoad(): Promise<PersonManagementViewPage> {
    await this.personTable.waitForDataLoad();
    return this;
  }

  public async setItemsPerPage(entries: 5 | 30 | 50 | 100 | 300): Promise<void> {
    await this.personTable.setItemsPerPage(entries);
  }

  private async filterByText(text: string, testId: string, exactMatch?: boolean): Promise<void> {
    const filter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId(testId));
    await filter.searchByTitle(text, exactMatch);
  }

  public async filterBySchule(name: string, exactMatch?: boolean): Promise<void> {
    await this.organisationAutocomplete.searchByTitle(name, exactMatch ?? false);
  }

  public async filterByRolle(rolle: string): Promise<void> {
    await this.rolleAutocomplete.searchByTitle(rolle, true);
  }

  public async filterByKlasse(klasse: string): Promise<void> {
    await this.filterByText(klasse, 'personen-management-klasse-select');
  }

  public async filterByStatus(status: string): Promise<void> {
    await this.filterByText(status, 'status-select');
  }

  public async resetFilter(): Promise<void> {
    await this.page.getByTestId('reset-filter-button').click();
  }

  public async searchByText(text: string): Promise<void> {
    await this.searchFilter.searchByText(text);
  }

  public async toggleColumnSort(columnName: string): Promise<void> {
    await this.personTable.clickColumnHeader(columnName, 'personen-frontend');
  }

  public async openGesamtuebersicht(name: string): Promise<PersonDetailsViewPage> {
    await this.personTable.getItemByText(name).click();
    const personDetailsViewPage: PersonDetailsViewPage = new PersonDetailsViewPage(this.page);
    await personDetailsViewPage.waitForPageLoad();
    return personDetailsViewPage;
  }

  public async searchAndOpenGesamtuebersicht(nameOrKopers: string): Promise<PersonDetailsViewPage> {
    await this.searchByText(nameOrKopers);
    return this.openGesamtuebersicht(nameOrKopers);
  }

  public async toggleSelectAllRows(select: boolean): Promise<void> {
    await this.personTable.toggleSelectAllRows(select);
  }

  public async selectPerson(name: string): Promise<void> {
    await this.personTable.selectRowByText(name);
  }

  public async selectMehrfachauswahl(option: string): Promise<void> {
    await this.page.getByTestId('benutzer-edit-select').click();
    await this.personTable.clickDropdownOption(option);
  }

  public closeDialog(buttonId: string): Promise<void> {
    return this.page.getByTestId(buttonId).click();
  }

  public async versetzeSchueler(klassenname: string): Promise<void> {
    await this.page.getByTestId('bulk-change-klasse-klasse-select').click();
    await this.page.getByRole('option', { name: klassenname, exact: true }).click();
    await this.page.getByTestId('bulk-change-klasse-button').click();
  }

  /* assertions */
  public async checkManagementPage(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('person-management-headline')).toHaveText('Benutzerverwaltung');
    await expect(this.page.getByTestId('reset-filter-button')).toBeVisible();
    await this.organisationAutocomplete.isVisible();
    await expect(this.page.getByTestId('rolle-select')).toBeVisible();
    await expect(this.page.getByTestId('personen-management-klasse-select')).toBeVisible();
    await expect(this.page.getByTestId('status-select')).toBeVisible();
    await expect(this.page.getByTestId('benutzer-edit-select')).toBeVisible();
    await expect(this.page.getByTestId('search-filter-input')).toBeVisible();
    await expect(this.page.getByTestId('apply-search-filter-button')).toBeVisible();
    await expect(this.page.getByTestId('person-table')).toBeVisible();
    await this.checkHeaders([
      'Nachname',
      'Vorname',
      'Benutzername',
      'KoPers.-Nr.',
      'Rolle',
      'Schulzuordnung(en)',
      'Klasse',
    ]);
  }

  public async checkIfPersonExists(name: string): Promise<void> {
    await this.personTable.checkIfItemIsVisible(name);
  }

  public async checkIfPersonNotExists(name: string): Promise<void> {
    await this.personTable.checkIfItemIsNotVisible(name);
  }

  public async checkRowCount(expectedRowCount: number): Promise<void> {
    await this.personTable.checkRowCount(expectedRowCount);
  }

  public async checkHeaders(expectedHeaders: string[]): Promise<void> {
    await this.personTable.checkHeaders(expectedHeaders);
  }

  private async checkIfColumnAlwaysContainsText(columnIndex: number, expectedText: string): Promise<void> {
    const column: Locator = await this.personTable.getColumn(columnIndex);
    // we don't know how many valid rows there should be, so we have to check that no invalid rows are present
    // using count or all is flaky, because we can't be sure if the table has updated already
    await expect(column.filter({ hasNotText: expectedText })).toHaveCount(0);
  }

  public async checkAllDropdownOptionsVisible(options: string[], dropDownId: string, hasHeader: boolean, exactCount: boolean = false): Promise<void> {
    await this.personTable.checkAllDropdownOptionsVisible(
      options,
      this.page.getByTestId(dropDownId),
      hasHeader? `${options.length} Klassen gefunden` : undefined,
      exactCount
    );
  }

  public async checkAllDropdownOptionsClickable(klassenNamen: string[]): Promise<void> {
    await this.personTable.checkAllDropdownOptionsClickable(klassenNamen, this.page.getByTestId('personen-management-klasse-select'));
  }

  public async checkIfSchuleIsCorrect(schulname: string, schulNr?: string): Promise<void> {
    const expected: string = schulNr ? `${schulNr} (${schulname})` : schulname;
    await this.organisationAutocomplete.checkText(expected);
    await this.checkIfColumnAlwaysContainsText(7, schulNr ? schulNr : schulname)
  }

  public async checkIfRolleIsCorrect(rolleName: string): Promise<void> {
    await this.rolleAutocomplete.checkText(rolleName);
    await this.checkIfColumnAlwaysContainsText(6, rolleName)
  }

  public async checkIfColumnHeaderSorted(columnName: string, sortingStatus: 'ascending' | 'descending' | 'not-sortable'): Promise<void> {
    await this.personTable.checkIfColumnHeaderSorted(columnName, sortingStatus);
  }

  public async checkIfColumnDataSorted(cellIndex: number, sortOrder: 'ascending' | 'descending'): Promise<void> {
    await this.personTable.checkIfColumnDataSorted(cellIndex, sortOrder);
  }

  public async checkIfPersonIsSelected(name: string): Promise<void> {
    return this.personTable.checkIfRowIsSelectedByText(name);
  }

  public async checkSchuelerVersetzenDialog(klassenNamen: string[]): Promise<void> {
    await expect(this.dialogCard).toBeVisible(); 
    await expect(this.dialogCard.getByTestId('layout-card-headline')).toHaveText('Schüler versetzen');
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-klasse-select')).toBeVisible();
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-button')).toBeVisible();
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-discard-button')).toBeVisible();

    await this.checkAllDropdownOptionsVisible(
      klassenNamen,
      'bulk-change-klasse-klasse-select',
      undefined,
      true
    );
  }

  public async checkSchuelerVersetzenInProgress(): Promise<void> {
    const progressbar: Locator = this.dialogCard.getByTestId('bulk-change-klasse-progressbar');
    await expect(progressbar).toBeVisible();
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-close-button')).toBeHidden(); 
    // Warte bis Progressbar zu 100% abgeschlossen ist
    await expect(progressbar).toHaveAttribute('aria-valuenow', '100', { timeout: 30000 });
  }

  public async checkSchuelerVersetzenSuccessDialog(): Promise<void> {
    await expect(this.dialogCard).toBeVisible(); 
    await expect(this.dialogCard.getByTestId('layout-card-headline')).toHaveText('Schüler versetzen');
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-success-text')).toHaveText('Die ausgewählten Schülerinnen und Schüler wurden erfolgreich versetzt.');
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-progressbar')).toHaveText('100%');
    await expect(this.dialogCard.getByTestId('bulk-change-klasse-close-button')).toBeVisible(); 
  }

  public async checkSchuelerVersetzenErrorDialog(expectedErrors: 'all' | 'schule' | 'rolle'): Promise<void> {
    const dialogCard: Locator = this.page.getByTestId('invalid-selection-alert-dialog-layout-card');
    await expect(dialogCard).toBeVisible();
    
    const dialogText: string = await dialogCard.textContent();
    
    const schulError: string = 'Bitte wählen Sie im Filter genau eine Schule aus, um die Aktion durchzuführen.';
    const rolleError: string = 'Bitte wählen Sie nur Benutzer mit einer Schülerrolle aus, um die Aktion durchzuführen.';
    
    if (expectedErrors === 'schule') {
      await expect(dialogText).toContain(schulError);
      await expect(dialogText).not.toContain(rolleError);
    } else if (expectedErrors === 'rolle') {
      await expect(dialogText).toContain(rolleError);
      await expect(dialogText).not.toContain(schulError);
    } else {
      await expect(dialogText).toContain(schulError);
      await expect(dialogText).toContain(rolleError);
    }
    
    await expect(this.page.getByTestId('invalid-selection-alert-dialog-cancel-button')).toBeVisible();
  }

  public async checkNewKlasseNachVersetzen(schuelerListe: UserInfo[], klasseName: string): Promise<void> {
    for (const schueler of schuelerListe) {
      await this.personTable.checkCellInRow(schueler.username, 7, klasseName);
    }
  }
}
