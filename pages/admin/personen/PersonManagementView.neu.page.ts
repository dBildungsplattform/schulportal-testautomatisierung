import { expect, Locator, Page, Request } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { DataTable } from '../../components/DataTable.neu.page';
import { PersonDetailsViewPage } from './details/PersonDetailsView.neu.page';
import { SearchFilter } from '../../../elements/SearchFilter';
import { MenuBarPage } from '../../components/MenuBar.neu.page';
import { waitForAPIResponse } from '../../../base/api/baseApi';

export class PersonManagementViewPage {
  private readonly personTable: DataTable;
  private readonly searchFilter: SearchFilter;
  private readonly organisationAutocomplete: Autocomplete;
  public readonly menu: MenuBarPage;
  private readonly table: Locator;

  constructor(protected readonly page: Page) {
    this.table = this.page.getByTestId('person-table');
    this.personTable = new DataTable(this.page, this.table);
    this.searchFilter = new SearchFilter(this.page, 'dbiam/personenuebersicht');
    this.organisationAutocomplete = new Autocomplete(
      this.page,
      this.page.getByTestId('person-management-organisation-select')
    );
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('admin-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('person-management-headline')).toHaveText('Benutzerverwaltung');
    await expect(this.page.getByTestId('person-table')).not.toContainText('Keine Daten');
    return this;
  }

  private async filterByText(text: string, testId: string): Promise<void> {
    const filter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId(testId));
    await filter.selectByTitle(text);
  }

  public async filterBySchule(name: string, dienststellenNr?: string): Promise<void> {
    const displayName: string = dienststellenNr ? `${dienststellenNr} (${name})` : name;
    await this.organisationAutocomplete.searchByTitle(displayName, true);
    await waitForAPIResponse(this.page, 'personen-frontend*');
    await waitForAPIResponse(this.page, 'dbiam/personenuebersicht');
}

  public async filterByRolle(rolle: string): Promise<void> {
    await this.filterByText(rolle, 'rolle-select');
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

  public async checkIfSchuleIsCorrect(schulname: string, schulNr?: string): Promise<void> {
    const expected: string = schulNr ? `${schulNr} (${schulname})` : schulname;
    await this.organisationAutocomplete.checkText(expected);
    await this.personTable.checkColumn(7, schulNr ? schulNr : schulname);
  }
}
