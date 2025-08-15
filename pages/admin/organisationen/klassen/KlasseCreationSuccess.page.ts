import { expect, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { KlasseCreationParams, KlasseCreationViewPage } from './KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from './KlasseManagementView.neu.page';

export class KlasseCreationSuccessPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('klasse-success-text').waitFor({ state: 'visible' });
  }

  public async goBackToCreateAnotherKlasse(): Promise<KlasseCreationViewPage> {
    await this.page.getByTestId('create-another-klasse-button').click();
    return new KlasseCreationViewPage(this.page);
  }

  public async goBackToList(): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('back-to-list-button').click();
    return new KlasseManagementViewPage(this.page);
  }

  /* assertions */
  public async checkSuccessfulCreation(params: KlasseCreationParams): Promise<void> {
    await expect(this.page.getByTestId('klasse-success-text')).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
    await expect(this.page.getByTestId('klasse-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('created-klasse-schule')).toHaveText(params.schulname);
    await expect(this.page.getByTestId('created-klasse-name')).toHaveText(params.klassenname);
  }
}
