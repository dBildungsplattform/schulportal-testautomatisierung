import { expect, type Locator, Page } from '@playwright/test';
import { AbstractManagementViewPage } from '../../AbstractManagementView.page';
import { DataTable } from '../../components/DataTable.page';

export class SchuleManagementViewPage extends AbstractManagementViewPage {
  /* add global locators here */
  private readonly schuleTable: DataTable = new DataTable(this.page, this.page.getByTestId('klasse-table'));

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('schule-management-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Schulverwaltung');
    return expect(this.page.getByTestId('schule-table')).not.toContainText('Keine Daten');
  }

  /* assertions */
}
