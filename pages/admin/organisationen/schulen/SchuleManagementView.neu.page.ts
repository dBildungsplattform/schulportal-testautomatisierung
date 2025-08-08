import { expect, type Locator, Page } from '@playwright/test';
import { AbstractManagementViewPage } from '../../../abstracts/AbstractManagementView.page';
import { DataTable } from '../../../components/DataTable.neu.page';
import { SearchFilter } from '../../../../elements/SearchFilter';

export class SchuleManagementViewPage extends AbstractManagementViewPage {
  /* add global locators here */
  private readonly schuleTable: DataTable = new DataTable(this.page, this.page.getByTestId('schule-table'));
  private readonly searchFilter: SearchFilter = new SearchFilter(this.page);

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('schule-management-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Schulverwaltung');
    return expect(this.page.getByTestId('schule-table')).not.toContainText('Keine Daten');
  }

  public async searchAndSyncItslearning(schulname: string): Promise<void> {
    await this.searchFilter.searchByText(schulname);
    
    await this.page.getByTestId('open-schule-itslearning-sync-dialog-icon').click();
    await expect(this.page.getByTestId('schule-activate-in-itslearning-confirmation-text')).toHaveText(`Wollen Sie die Daten der Schule ${schulname} an itslearning übertragen?`);
    await this.page.getByTestId('schule-itslearning-sync-button').click();
    await expect(this.page.getByTestId('activate-schule-sync-itslearning-success-text')).toHaveText(`Die Schule ${schulname} wird in itslearning angelegt.`);
    await this.page.getByTestId('close-schule-sync-itslearning-dialog-button').click();
    await this.waitForPageLoad();
  }

  /* assertions */
}
