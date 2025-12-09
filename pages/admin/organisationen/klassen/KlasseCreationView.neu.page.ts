import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { KlasseCreationSuccessPage } from './KlasseCreationSuccess.page';
import { KlasseManagementViewPage } from './KlasseManagementView.neu.page';

export interface KlasseCreationParams {
    schulname: string,
    klassenname: string,
    schulNr?: string
}

export class KlasseCreationViewPage {
  /* add global locators here */

  private readonly adminHeadline: Locator = this.page.getByTestId('admin-headline');
  private readonly layoutCardHeadline: Locator = this.page.getByTestId('layout-card-headline');
  private readonly schuleName : Locator = this.page.getByTestId('klasse-form-schule-select');
  private readonly schuleNameInput : Locator = this.page.getByTestId('klasse-form-schule-select').locator('input');
  private readonly klasseNameInput : Locator = this.page.getByTestId('klassenname-input').locator('input');
  private readonly klasseVerwerfenButton : Locator = this.page.getByTestId('klasse-form-discard-button');
  private readonly klasseAnlegenButton : Locator = this.page.getByTestId('klasse-form-submit-button');

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<KlasseCreationViewPage> {
    await this.page.getByTestId('klasse-creation-card').waitFor({ state: 'visible' });
    await expect(this.layoutCardHeadline).toHaveText('Neue Klasse hinzufügen');
    return this;
  }

  public async createKlasse(landesadmin : boolean, params: KlasseCreationParams): Promise<KlasseCreationSuccessPage> {
    if (landesadmin) {
      const schuleNameAutocomplete: Autocomplete = new Autocomplete(this.page, this.schuleName);
      await schuleNameAutocomplete.searchByTitle(params.schulname, false);
    } else {
      await expect(this.schuleName).toHaveText(`${params.schulNr} (${params.schulname})`);
    }

    await this.klasseNameInput.waitFor({ state: 'visible' });
    await this.klasseNameInput.fill(params.klassenname);

    await this.klasseAnlegenButton.waitFor({ state: 'visible' });
    await this.klasseAnlegenButton.click();

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

  public async checkCreateForm(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Administrationsbereich');
    await expect(this.layoutCardHeadline).toHaveText('Neue Klasse hinzufügen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Mit * markierte Felder sind Pflichtangaben.', { exact: false })).toBeVisible();

    await expect(this.page.getByText('1. Schule zuordnen', { exact: false })).toBeVisible();
    await expect(this.schuleNameInput).toBeVisible();

    await expect(this.page.getByText('2. Klassenname eingeben', { exact: false })).toBeVisible();
    await expect(this.klasseNameInput).toBeVisible();

    await expect(this.klasseVerwerfenButton).toBeEnabled();
    await expect(this.klasseAnlegenButton).toBeDisabled();
  }
}
