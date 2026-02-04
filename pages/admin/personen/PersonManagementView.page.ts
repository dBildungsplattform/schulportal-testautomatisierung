import { type Locator, Page, expect } from '@playwright/test';
import { PersonDetailsViewPage } from './PersonDetailsView.page';
import { Autocomplete } from '../../components/Autocomplete';

export class PersonManagementViewPage {
  readonly page: Page;
  readonly textH1Administrationsbereich: Locator;
  readonly textH2Benutzerverwaltung: Locator;
  readonly inputSuchfeld: Locator;
  readonly filterResetButton: Locator;
  readonly buttonSuchen: Locator;
  readonly tableHeaderNachname: Locator;
  readonly tableHeaderVorname: Locator;
  readonly tableHeaderBenutzername: Locator;
  readonly tableHeaderKopersNr: Locator;
  readonly tableHeaderRolle: Locator;
  readonly tableHeaderZuordnungen: Locator;
  readonly tableHeaderKlasse: Locator;
  readonly tableWrapper: Locator;
  readonly comboboxMenuIconSchule: Locator;
  readonly comboboxMenuIconRolle: Locator;
  readonly comboboxMenuIconKlasse: Locator;
  readonly comboboxMenuIconStatus: Locator;
  readonly comboboxMenuIconSchuleInput: Locator;
  readonly comboboxSchule: Autocomplete;

  constructor(page: Page) {
    this.page = page;
    this.textH1Administrationsbereich = page.getByTestId('admin-headline');
    this.textH2Benutzerverwaltung = page.getByTestId('person-management-headline');
    this.inputSuchfeld = page.locator('[data-testid="search-filter-input"] input');
    this.filterResetButton = page.locator('[data-testid="reset-filter-button"]');
    this.buttonSuchen = page.getByTestId('apply-search-filter-button');
    this.tableHeaderNachname = page.getByTestId('person-table').getByText('Nachname', { exact: true });
    this.tableHeaderVorname = page.getByTestId('person-table').getByText('Vorname', { exact: true });
    this.tableHeaderBenutzername = page.getByText('Benutzername', { exact: true });
    this.tableHeaderKopersNr = page.getByText('KoPers.-Nr.');
    this.tableHeaderRolle = page.getByTestId('person-table').getByText('Rolle', { exact: true });
    this.tableHeaderZuordnungen = page.getByText('Zuordnung(en)');
    this.tableHeaderKlasse = page.getByTestId('person-table').getByText('Klasse', { exact: true });
    this.tableWrapper = page.getByTestId('person-table');
    this.comboboxMenuIconSchule = page.locator('[data-testid="person-management-organisation-select"] .mdi-menu-down');
    this.comboboxMenuIconSchuleInput = page.locator('[data-testid="person-management-organisation-select"] input');
    this.comboboxMenuIconRolle = page.locator('[data-testid="rolle-select"] .mdi-menu-down');
    this.comboboxMenuIconKlasse = page.locator('[data-testid="personen-management-klasse-select"] .mdi-menu-down');
    this.comboboxMenuIconStatus = page.locator('[data-testid="status-select"] .mdi-menu-down');
    this.comboboxSchule = new Autocomplete(this.page, page.getByTestId('person-management-organisation-select'));
  }

  public async navigateToPersonDetailsViewByNachname(nachname: string): Promise<PersonDetailsViewPage> {
    await this.page.getByRole('cell', { name: nachname, exact: true }).click();

    return new PersonDetailsViewPage(this.page);
  }

  public async searchBySuchfeld(name: string): Promise<void> {
    // Make sure the search input is visible before filling it
    await expect(this.inputSuchfeld).toBeVisible();

    await this.inputSuchfeld.fill(name);

    // Triggers the click and starts listening for the response at the same time
    // Guarantees that the response is awaited only after the click and that it won't be missed even if it happens fast
    await Promise.all([
      this.page.waitForResponse((response) =>
        response.url().includes('/api/dbiam/personenuebersicht') &&
        response.status() === 201
      ),
      this.buttonSuchen.click(),
    ]);
    // Wait for the table to be populated with the search results
    await this.page.getByRole('cell', { name, exact: true }).waitFor({ state: 'visible' });

    await expect(this.inputSuchfeld).toHaveValue(name);
    await expect(this.comboboxMenuIconStatus).toBeVisible();
  }

  public async openGesamtuebersichtPerson(page: Page, name: string): Promise<PersonDetailsViewPage> {
    await page.getByRole('cell', { name: name, exact: true }).click();
    const personDetailsViewPage: PersonDetailsViewPage = new PersonDetailsViewPage(page);
    await personDetailsViewPage.waitForPageToBeLoaded();
    return personDetailsViewPage;
  }

  public async waitForData(): Promise<void> {
    await expect(this.tableWrapper).not.toContainText('Keine Daten');
  }

  public getRows(): Locator {
    return this.tableWrapper.locator('.v-data-table__tr');
  }

  public async waitErgebnislisteIsLoaded(): Promise<void> {
    await this.page.waitForResponse('/api/dbiam/personenuebersicht');
    await expect(this.textH2Benutzerverwaltung).toContainText('Benutzerverwaltung');
  }

  public async filterSchule(schule: string): Promise<void> {
    await this.comboboxSchule.searchByTitle(schule, false, 'organisationen**');
  }

  public async resetFilter(): Promise<void> {
    await this.filterResetButton.click();
    await expect(this.inputSuchfeld).toHaveValue('');
    await expect(this.comboboxMenuIconSchuleInput).toHaveValue('');
    await this.waitErgebnislisteIsLoaded();
  }
}
