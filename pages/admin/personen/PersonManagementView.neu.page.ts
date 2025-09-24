import { expect, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { DataTable } from '../../components/DataTable.neu.page';
import { PersonDetailsViewPage } from './details/PersonDetailsView.neu.page';
import { AbstractManagementViewPage } from '../../abstracts/AbstractManagementView.page';
import { SearchFilter } from '../../../elements/SearchFilter';

export class PersonManagementViewPage extends AbstractManagementViewPage {
  private readonly personTable: DataTable = new DataTable(this.page, this.page.getByTestId('person-table'));
  private readonly searchFilter: SearchFilter = new SearchFilter(this.page);

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('admin-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Benutzerverwaltung');
    await expect(this.page.getByTestId('person-table')).not.toContainText('Keine Daten');
  }

  private async filterByText(text: string, testId: string, endpoint: string): Promise<void> {
    const filter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId(testId));
    await filter.searchByTitle(text, false, endpoint);
  }
  public async filterBySchule(schule: string): Promise<void> {
    await this.filterByText(schule, 'person-management-schule-select', 'organisationen**');
  }
  public async filterByRolle(rolle: string): Promise<void> {
    await this.filterByText(rolle, 'rolle-select', 'rollen**');
  }

  public async openGesamtuebersicht(name: string): Promise<PersonDetailsViewPage> {
    await this.personTable.getItemByText(name).click();
    const personDetailsViewPage: PersonDetailsViewPage = new PersonDetailsViewPage(this.page);
    await personDetailsViewPage.waitForPageLoad();
    return personDetailsViewPage;
  }

  public async searchAndOpenGesamtuebersicht(nameOrKopers: string): Promise<PersonDetailsViewPage> {
    await this.searchFilter.searchByText(nameOrKopers);
    return this.openGesamtuebersicht(nameOrKopers);
  }

  /* assertions */
  public async checkIfPersonExists(name: string): Promise<void> {
    await this.personTable.checkIfItemIsVisible(name);
  }
  public async checkIfPersonNotExists(name: string): Promise<void> {
    await this.personTable.checkIfItemIsNotVisible(name);
  }

  public async checkHeaders(expectedHeaders: string[]): Promise<void> {
    await this.personTable.checkHeaders(expectedHeaders);
  }

}
