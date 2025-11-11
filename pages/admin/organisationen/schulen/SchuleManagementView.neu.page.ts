import { expect, Page } from '@playwright/test';
import { DataTable } from '../../../components/DataTable.neu.page';
import { SearchFilter } from '../../../../elements/SearchFilter';

export class SchuleManagementViewPage {
  /* add global locators here */
  private readonly schuleTable: DataTable = new DataTable(this.page, this.page.getByTestId('schule-table'));
  private readonly searchFilter: SearchFilter = new SearchFilter(this.page);

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('schule-management-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('schule-management-headline')).toHaveText('Schulverwaltung');
    await expect(this.page.getByTestId('schule-table')).not.toContainText('Keine Daten');
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
