import { expect, type Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';
import { KlasseCreationParams } from './KlasseCreationView.neu.page';

export class KlasseCreationSuccessPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('klasse-success-text').waitFor({ state: 'visible' });
  }

  public async goBackToCreateAnotherKlasse(): Promise<void> {
    const createAnotherKlasseButton: Locator = this.page.getByTestId('create-another-klasse-button');

    await createAnotherKlasseButton.click();
  }

  public async goBackToList(): Promise<void> {
    const backToListButton: Locator = this.page.getByTestId('back-to-list-button');

    await backToListButton.click();
  }

  /* assertions */
  public async checkSuccessfulCreation(params: KlasseCreationParams): Promise<void> {
    const successText: Locator = this.page.getByTestId('klasse-success-text');
    const successIcon: Locator = this.page.getByTestId('klasse-success-icon');
    const savedDataSchuleText: Locator = this.page.getByTestId('created-klasse-schule');
    const savedDataKlasseText: Locator = this.page.getByTestId('created-klasse-name');

    await expect(successText).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
    await successIcon.isVisible();
    await expect(savedDataSchuleText).toHaveText(params.schulname);
    await expect(savedDataKlasseText).toHaveText(params.klassenname);
  }
}
