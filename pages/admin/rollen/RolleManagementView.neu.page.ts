import { expect, type Page } from '@playwright/test';
import { AbstractManagementViewPage } from '../../abstracts/AbstractManagementView.page';
import { RolleDetailsViewPage } from './RolleDetailsView.neu.page';
import { DataTable } from '../../components/DataTable.neu.page';

export class RolleManagementViewPage extends AbstractManagementViewPage {
  /* add global locators here */
  private readonly rolleTable: DataTable = new DataTable(this.page, this.page.getByTestId('rolle-table'));

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('rolle-management-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Rollenverwaltung');
    return expect(this.page.getByTestId('rolle-table')).not.toContainText('Keine Daten');
  }

  public async openGesamtuebersicht(rollenname: string): Promise<RolleDetailsViewPage> {
    await this.rolleTable.getItemByText(rollenname).click();
    const rolleDetailsViewPage: RolleDetailsViewPage = new RolleDetailsViewPage(this.page);
    await rolleDetailsViewPage.waitForPageLoad();
    return rolleDetailsViewPage;
  }

  /* assertions */
}
