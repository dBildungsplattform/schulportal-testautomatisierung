import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { waitForAPIResponse } from '../../../../base/api/baseApi';
import { PersonCreationSuccessPage } from './PersonCreationSuccess.page';

export interface PersonCreationParams {
  organisation: string;
  rollen: string[];
  vorname: string;
  nachname: string;
  klasse?: string;
  kopersnr?: string;
  befristung?: string;
}

export class PersonCreationViewPage {
  private static readonly ENDPOINT: string = 'personenkontext-workflow/**';
  private readonly organisationAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-organisation-select'));
  private readonly rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('rollen-select'));

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(expectedHeadline?: string): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('create-person-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('create-person-headline')).toHaveText(expectedHeadline || 'Neuen Benutzer hinzufügen');
    return this;
  }

  public async fillForm(params: PersonCreationParams): Promise<void> {
    const vornameInput: Locator = this.page.getByTestId('vorname-input').locator('.v-field__input');
    const nachnameInput: Locator = this.page.getByTestId('familienname-input').locator('.v-field__input');

    await this.organisationAutocomplete.searchByTitle(params.organisation, false, PersonCreationViewPage.ENDPOINT);

    await Promise.all(
      params.rollen.map((rolle: string) => this.rolleAutocomplete.searchByTitle(rolle, true, PersonCreationViewPage.ENDPOINT))
    );

    await vornameInput.waitFor({ state: 'visible' });
    await vornameInput.fill(params.vorname);

    await nachnameInput.waitFor({ state: 'visible' });
    await nachnameInput.fill(params.nachname);

    if (params.klasse) {
      const autocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-klasse-select'));
      await autocomplete.searchByTitle(params.klasse, true);
    }
    if (params.kopersnr) {
      const kopersnrInput: Locator = this.page.getByTestId('kopersnr-input').locator('.v-field__input');
      await kopersnrInput.waitFor({ state: 'visible' });
      await kopersnrInput.fill(params.kopersnr);
    }
    if (params.befristung) {
      console.warn('Befristung field is not implemented yet.');
    }
  }

  public async clearOrganisation(): Promise<void> {
    await this.organisationAutocomplete.clear();
    await waitForAPIResponse(this.page, PersonCreationViewPage.ENDPOINT);
  }

  public async submit(): Promise<PersonCreationSuccessPage> {
    await this.page.getByTestId('person-creation-form-submit-button').click();
    return new PersonCreationSuccessPage(this.page);
  }

  /* assertions */
  public async checkAvailableRollen(includes: string[], excludes: string[]): Promise<void> {
    for (const includedRolle of includes) {
      await this.rolleAutocomplete.validateItemExists(includedRolle, true);
    }
    for (const excludedRolle of excludes) {
      await this.rolleAutocomplete.validateItemNotExists(excludedRolle, true);
    }
  }
}

