import { expect, type Locator, Page } from '@playwright/test';
import { AbstractManagementViewPage } from '../../abstracts/AbstractManagementView.page';
import { DataTable } from '../../components/DataTable.page';

export class SchuleManagementViewPage extends AbstractManagementViewPage {
  /* add global locators here */
  private readonly schuleTable: DataTable = new DataTable(this.page, this.page.getByTestId('schule-table'));

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
    await this.searchByText(schulname);
    
    const syncButton: Locator = this.page.getByTestId('open-schule-itslearning-sync-dialog-icon');
    const syncDialogText: Locator = this.page.getByTestId('schule-activate-in-itslearning-confirmation-text');
    const syncDialogConfirmButton: Locator = this.page.getByTestId('schule-itslearning-sync-button');
    const syncSuccessText: Locator = this.page.getByTestId('activate-schule-sync-itslearning-success-text');
    const closeSuccessDialogButton: Locator = this.page.getByTestId('close-schule-sync-itslearning-dialog-button');
    
    await syncButton.click();
    await expect(syncDialogText).toHaveText(`Wollen Sie die Daten der Schule ${schulname} an itslearning übertragen?`);
    await syncDialogConfirmButton.click();
    await expect(syncSuccessText).toHaveText(`Die Schule ${schulname} wird in itslearning angelegt.`);
    await closeSuccessDialogButton.click();
    await this.waitForPageLoad();
  }

  /* assertions */
}
