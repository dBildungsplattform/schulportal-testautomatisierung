import { expect, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { waitForAPIResponse } from '../../../../base/api/testHelper.page';
import { PersonCreationSuccessPage } from './PersonCreationSuccess.page';

export type PersonCreationParams = {
  organisation: string;
  rollen: string[];
  vorname: string;
  nachname: string;
  klasse?: string;
  kopersnr?: string;
  befristung?: string;
}

export class PersonCreationViewPage extends AbstractAdminPage {
  private readonly endpoint: string = 'personenkontext-workflow/**';
  private readonly organisationAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('organisation-select'));
  private readonly rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('rollen-select'));

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(expectedHeadline: string): Promise<void> {
    await this.page.getByTestId('person-creation-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText(expectedHeadline);
  }

  public async fillForm(params: PersonCreationParams): Promise<void> {
    const vornameInput = this.page.getByTestId('vorname-input').locator('.v-field__input');
    const nachnameInput = this.page.getByTestId('familienname-input').locator('.v-field__input');

    await this.organisationAutocomplete.searchByTitle(params.organisation, false, this.endpoint);

    await Promise.all(
      params.rollen.map((rolle: string) => this.rolleAutocomplete.searchByTitle(rolle, true, this.endpoint))
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
      const kopersnrInput = this.page.getByTestId('kopersnr-input').locator('.v-field__input');
      await kopersnrInput.waitFor({ state: 'visible' });
      await kopersnrInput.fill(params.kopersnr);
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

