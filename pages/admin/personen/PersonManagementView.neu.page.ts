import { expect, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { DataTable } from '../../components/DataTable.page';
import { PersonDetailsViewPage } from './details/PersonDetailsView.neu.page';
import { AbstractManagementViewPage } from '../../abstracts/AbstractManagementView.page';

export class PersonManagementViewPage extends AbstractManagementViewPage {
  private readonly personTable: DataTable = new DataTable(this.page, this.page.getByTestId('person-table'));

  constructor(page: Page) {
    super(page);
  }

  /* actions */

  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('admin-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Benutzerverwaltung');
    return expect(this.page.getByTestId('person-table')).not.toContainText('Keine Daten');
  }

  public async filterBySchule(schule: string): Promise<void> {
    const schuleFilter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    return schuleFilter.searchByTitle(schule, false, 'organisationen**');
  }

  public async filterByRolle(rolle: string): Promise<void> {
    const rolleFilter: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
    return rolleFilter.searchByTitle(rolle, false, 'rollen**');
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
  public async checkIfPersonExists(name: string): Promise<void> {
    return this.personTable.checkIfItemIsVisible(name);
  }
  public async checkIfPersonNotExists(name: string): Promise<void> {
    return this.personTable.checkIfItemIsNotVisible(name);
  }

  public async checkHeaders(expectedAmount: number, expectedHeaders: string[]): Promise<void> {
    this.personTable.checkHeaders(expectedAmount, expectedHeaders);
  }

}
