import { expect, type Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { SchuleCreationViewPage, type SchuleCreationParams } from './SchuleCreationView.neu.page';
import { SchuleManagementViewPage } from './SchuleManagementView.neu.page';

export class SchuleCreationSuccessPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('schule-success-text').waitFor({ state: 'visible' });
  }

  public async goBackToCreateAnotherSchule(): Promise<SchuleCreationViewPage> {
    await this.page.getByTestId('create-another-schule-button').click();
    return new SchuleCreationViewPage(this.page);
  }

  public async goBackToList(): Promise<SchuleManagementViewPage> {
    await this.page.getByTestId('back-to-list-button').click();
    return new SchuleManagementViewPage(this.page);
  }

  /* assertions */
  public async checkSuccessfulCreation(params: SchuleCreationParams): Promise<void> {
    await expect(this.page.getByTestId('schule-success-text')).toHaveText('Die Schule wurde erfolgreich hinzugefügt.');
    await expect(this.page.getByTestId('schule-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('created-schule-name')).toHaveText(params.name);
    await expect(this.page.getByTestId('created-schule-dienststellennummer')).toHaveText(params.dienststellenNr);
    await expect(this.page.getByTestId('created-schule-form')).toHaveText('Öffentliche Schulen Land Schleswig-Holstein');
  }
}
