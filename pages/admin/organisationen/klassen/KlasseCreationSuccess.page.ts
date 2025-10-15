import { expect, Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { KlasseCreationParams, KlasseCreationViewPage } from './KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from './KlasseManagementView.neu.page';

export class KlasseCreationSuccessPage extends AbstractAdminPage {
  /* add global locators here */
  private readonly headline: Locator = this.page.getByTestId('layout-card-headline');

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
  public async checkSuccessPage(
    params: KlasseCreationParams
  ): Promise<void> {
    /* header */
    await expect(this.headline).toHaveText('Neue Klasse hinzufügen');
    await expect(this.page.getByTestId('klasse-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('klasse-success-text')).toBeVisible();

    /* buttons */
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByTestId('create-another-klasse-button')).toBeVisible();
    await expect(this.page.getByTestId('back-to-list-button')).toBeVisible();

    /* key column */
    await expect(this.page.getByTestId('following-data-created-text')).toBeVisible();
    await expect(this.page.getByTestId('created-klasse-schule-label')).toBeVisible();
    await expect(this.page.getByTestId('created-klasse-name-label')).toBeVisible();

    /* value column */
    await expect(this.page.getByTestId('created-klasse-schule'))
      .toContainText(params.schulname);
    await expect(this.page.getByTestId('created-klasse-name'))
      .toHaveText(params.klassenname);
  }
}
