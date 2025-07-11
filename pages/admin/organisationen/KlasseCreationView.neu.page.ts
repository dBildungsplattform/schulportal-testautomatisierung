import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../AbstractAdminPage.page';

export class KlasseCreationViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('klasse-creation-card').waitFor({ state: 'visible' });
  }

  public async createKlasse(
    schulname: string,
    klassenname: string,
  ): Promise<void> {
    const schuleNameAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    const klasseNameInput: Locator = this.page.getByTestId('klassenname-input');
    const klasseCreationButton: Locator = this.page.getByTestId('klasse-form-submit-button');

    await schuleNameAutocomplete.searchByTitle(schulname, true);
    await klasseNameInput.fill(klassenname);
    await klasseCreationButton.click();
  }

  public async createAnotherKlasse(schulname: string, klassenname: string,): Promise<void> {
    const createAnotherKlasseButton: Locator = this.page.getByTestId('create-another-klasse-button');

    await createAnotherKlasseButton.click();
    await this.createKlasse(schulname, klassenname);
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
  public async klasseSuccessfullyCreated(schulname: string, klassenname: string): Promise<void> {
    const successText: Locator = this.page.getByTestId('klasse-success-text');
    const successIcon: Locator = this.page.getByTestId('klasse-success-icon');
    const savedDataSchuleText: Locator = this.page.getByTestId('created-klasse-schule');
    const savedDataKlasseText: Locator = this.page.getByTestId('created-klasse-name');

    await expect(successText).toHaveText('Die Klasse wurde erfolgreich hinzugefügt.');
    await successIcon.isVisible();
    await expect(savedDataSchuleText).toHaveText(schulname);
    await expect(savedDataKlasseText).toHaveText(klassenname);
  }
}
