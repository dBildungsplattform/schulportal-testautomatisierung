import { type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../AbstractAdminPage.page';

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
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('klasse-creation-card').waitFor({ state: 'visible' });
  }

  public async createKlasse(params: KlasseCreationParams): Promise<void> {
    const schuleNameAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    const klasseNameInput: Locator = this.page.getByTestId('klassenname-input');
    const klasseCreationButton: Locator = this.page.getByTestId('klasse-form-submit-button');

    await schuleNameAutocomplete.searchByTitle(params.schulname, true);
    await klasseNameInput.fill(params.klassenname);
    await klasseCreationButton.click();
  }

  public async discardKlasseCreation(): Promise<void> {
    const klasseDismissalButton: Locator = this.page.getByTestId('klasse-form-discard-button');

    await klasseDismissalButton.click();
  }

  public async goBackToList(): Promise<void> {
    const backToListButton: Locator = this.page.getByTestId('back-to-list-button');

    await backToListButton.click();
  }

  /* assertions */
}
