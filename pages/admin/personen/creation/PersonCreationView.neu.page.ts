import { expect, Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../AbstractAdminPage.page';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { waitForAPIResponse } from '../../../../base/api/testHelper.page';
import { PersonCreationSuccessPage } from './PersonCreationSuccess.page';

export type PersonCreationParams = {
  organisation: string;
  rollen: Array<string>;
  vorname: string;
  nachname: string;
  klasse?: string;
  kopersnr?: string;
  befristung?: string;
};

export class PersonCreationViewPage extends AbstractAdminPage {
  private readonly endpoint: string = 'personenkontext-workflow/**';
  private readonly organisationAutocomplete = new Autocomplete(this.page, this.page.getByTestId('organisation-select'));
  private readonly rolleAutocomplete = new Autocomplete(this.page, this.page.getByTestId('rollen-select'));

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('person-creation-card').waitFor({ state: 'visible' });
  }

  public async fillForm(params: PersonCreationParams): Promise<void> {
    await this.organisationAutocomplete.searchByTitle(params.organisation, false, this.endpoint);

    await Promise.all(
      params.rollen.map((rolle: string) => this.rolleAutocomplete.searchByTitle(rolle, true, this.endpoint))
    );

    await this.page.getByTestId('vorname-input').locator('.v-field__input').fill(params.vorname);
    await this.page.getByTestId('familienname-input').locator('.v-field__input').fill(params.nachname);

    if (params.klasse) {
      const autocomplete = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-klasse-select'));
      await autocomplete.searchByTitle(params.klasse, true);
    }
    if (params.kopersnr) {
      await this.page.getByTestId('kopersnr-input').locator('.v-field__input').fill(params.kopersnr);
    }
    if (params.befristung) {
      throw new Error('Befristung field is not implemented yet.');
    }
  }

  public async clearOrganisation(): Promise<void> {
    await this.organisationAutocomplete.clear();
    return waitForAPIResponse(this.page, this.endpoint);
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
