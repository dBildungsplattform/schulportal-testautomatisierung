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

  public async createPerson(params: PersonCreationParams): Promise<PersonCreationSuccessPage> {
    await this.selectOrganisation(params.organisation);
    await Promise.all(params.rollen.map((rolle: string) => this.selectRolle(rolle)));
    await this.fillNames(params.vorname, params.nachname);
    if (params.klasse) {
      await this.selectKlasse(params.klasse);
    }
    if (params.kopersnr) {
        await this.fillKopersnr(params.kopersnr);
    }
    if (params.befristung) {
        await this.fillBefristung(params.befristung);
    }
    return this.submit();
  }

  public async selectOrganisation(searchString: string): Promise<void> {
    return this.organisationAutocomplete.searchByTitle(searchString, true, this.endpoint);
  }

  public async clearOrganisation(): Promise<void> {
    await this.organisationAutocomplete.clear();
    return waitForAPIResponse(this.page, this.endpoint);
  }

  public async selectRolle(searchString: string): Promise<void> {
    return this.rolleAutocomplete.searchByTitle(searchString, true, this.endpoint);
  }

  public async selectKlasse(searchString: string): Promise<void> {
    const autocomplete = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-klasse-select'));
    return autocomplete.searchByTitle(searchString, true);
  }

  public async fillNames(vorname: string, nachname: string): Promise<void> {
    await this.page.getByTestId('vorname-input').locator('.v-field__input').fill(vorname);
    return this.page.getByTestId('familienname-input').locator('.v-field__input').fill(nachname);
  }

  public async fillKopersnr(kopersnr: string): Promise<void> {
    return this.page.getByTestId('kopersnr-input').locator('.v-field__input').fill(kopersnr);
  }

  public async fillBefristung(befristung: string): Promise<void> {
    throw new Error('Befristung field is not implemented yet.');
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
