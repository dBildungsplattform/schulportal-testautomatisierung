import { type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';

export class KlasseCreationViewPage {
  readonly page: Page;
  readonly schuleNameAutocomplete: Autocomplete;
  readonly klasseNameInput: Locator;
  readonly klasseDismissalButton: Locator;
  readonly klasseCreationButton: Locator;
  readonly successText: Locator;
  readonly successIcon: Locator;
  readonly savedDataSchuleText: Locator;
  readonly savedDataKlasseText: Locator;
  readonly backToListButton: Locator;
  readonly createAnotherKlasseButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    // Anlage Klasse
    this.page = page;
    this.schuleNameAutocomplete = new Autocomplete(this.page, page.getByTestId('schule-select'));
    this.klasseNameInput = page.getByTestId('klassenname-input');
    this.klasseDismissalButton = page.getByTestId('klasse-form-discard-button');
    this.klasseCreationButton = page.getByTestId('klasse-form-submit-button');

    // Bestätigungsseite Klasse
    this.successText = page.getByTestId('klasse-success-text');
    this.successIcon = page.getByTestId('klasse-success-icon');
    this.savedDataSchuleText = page.getByTestId('created-klasse-schule');
    this.savedDataKlasseText = page.getByTestId('created-klasse-name');
    this.backToListButton = page.getByTestId('back-to-list-button');
    this.createAnotherKlasseButton = page.getByTestId('create-another-klasse-button');
    this.closeButton = page.getByTestId('close-layout-card-button');
  }

  public async createKlasse(
    schulname: string,
    klassenname: string,
  ): Promise<void> {
    
  }
}
