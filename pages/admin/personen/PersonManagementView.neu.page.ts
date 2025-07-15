import { expect, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../AbstractAdminPage.page';
import { PersonDetailsViewPage } from './details/PersonDetailsView.neu.page';

export class PersonManagementViewPage extends AbstractAdminPage {
  private readonly tableWrapper = this.page.getByTestId('person-table');
  private readonly searchFilterInput = this.page.getByTestId('search-filter-input').locator('input');

  constructor(page: Page) {
    super(page);
  }

  /* actions */

  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('admin-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Benutzerverwaltung');
    return expect(this.page.getByTestId('person-table')).not.toContainText('Keine Daten');
  }

  public async searchAndOpenGesamtuebersicht(nameOrKopers: string): Promise<PersonDetailsViewPage> {
    await this.searchBy(nameOrKopers);
    return this.openGesamtuebersicht(nameOrKopers);
  }

  public async searchBy(nameOrKopers: string): Promise<void> {
    await this.searchFilterInput.fill(nameOrKopers);
    return this.page.getByTestId('apply-search-filter-button').click();
  }

  public async filterBySchule(schule: string): Promise<void> {
    const autocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    return autocomplete.searchByTitle(schule, false, 'organisationen**');
  }

  public async openGesamtuebersicht(name: string): Promise<PersonDetailsViewPage> {
    await this.page.getByRole('cell', { name: name, exact: true }).click();
    const personDetailsViewPage: PersonDetailsViewPage = new PersonDetailsViewPage(this.page);
    await personDetailsViewPage.waitForPageLoad();
    return personDetailsViewPage;
  }

  /* assertions */
  public async checkIfEntryIsVisible(value: string): Promise<void> {
    return expect(this.tableWrapper.getByRole('cell', { name: value, exact: true })).toBeVisible();
  }

  public async checkIfHeadersAreVisible(): Promise<void> {
    // TODO: use new table object 
  }

}
