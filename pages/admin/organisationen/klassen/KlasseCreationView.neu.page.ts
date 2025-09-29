import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { KlasseCreationSuccessPage } from './KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from './KlasseManagementView.neu.page';

export interface KlasseCreationParams {
    schulname: string,
    klassenname: string,
}

export class KlasseCreationViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('klasse-creation-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klasse anlegen');
  }

  public async createKlasse(params: KlasseCreationParams): Promise<KlasseCreationSuccessPage> {
    const schuleNameAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('klasse-form-schule-select'));
    const klasseNameInput: Locator = this.page.getByTestId('klassenname-input');
    const createKlasseButton: Locator = this.page.getByTestId('klasse-form-submit-button');

    await schuleNameAutocomplete.searchByTitle(params.schulname, true);

    await klasseNameInput.waitFor({ state: 'visible' });
    await klasseNameInput.fill(params.klassenname);

    await createKlasseButton.waitFor({ state: 'visible' });
    await createKlasseButton.click();

    return new KlasseCreationSuccessPage(this.page);
  }

  public async discardKlasseCreation(): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('klasse-form-discard-button').click();

    return new KlasseManagementViewPage(this.page);
  }

  public async goBackToList(): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('back-to-list-button').click();

    return new KlasseManagementViewPage(this.page);
  }

  /* assertions */
}
