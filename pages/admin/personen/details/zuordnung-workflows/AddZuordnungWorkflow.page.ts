import { expect, type Page } from '@playwright/test';
import { Autocomplete } from '../../../../../elements/Autocomplete';
import { ZuordnungenPage } from '../Zuordnungen.page';
import { waitForAPIResponse } from '../../../../../base/api/baseApi';

export class AddZuordnungWorkflowPage {
  /* add global locators here */
  private readonly organisationen: Autocomplete;
  private readonly rollen: Autocomplete;
  private static readonly ENDPOINT: string = 'personenkontext-workflow/**';

  constructor(protected readonly page: Page) {
    this.organisationen = new Autocomplete(this.page, this.page.getByTestId('organisation-select'));
    this.rollen = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
  }

  /* actions */
  public async submit(): Promise<ZuordnungenPage> {
    await this.page.getByTestId('zuordnung-creation-submit-button').click();
    await this.page.getByRole('button', { name: 'Ja' }).click();
    await waitForAPIResponse(this.page, AddZuordnungWorkflowPage.ENDPOINT);
    return new ZuordnungenPage(this.page);
  }

  public async selectOrganisation(organisation: string): Promise<void> {
    await this.organisationen.searchByTitle(organisation, true);
  }

  public async selectRolle(rolle: string): Promise<void> {
    await this.rollen.searchByTitle(rolle, true, AddZuordnungWorkflowPage.ENDPOINT);
  }

  public async fillKopers(kopers: string): Promise<void> {
    await this.page.getByTestId('kopersnr-input').locator('.v-field__input').fill(kopers);
  }

  public async fillBefristung(befristung: string): Promise<void> {
    await this.page.locator('[data-testid="befristung-input"] input').fill(befristung);
  }

  /* assertions */
  public async checkSelectedOrganisation(organisation: string): Promise<void> {
    await this.organisationen.checkText(organisation);
  }

  public async checkSelectedBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    if (option === 'schuljahresende') await expect(this.page.getByLabel('Bis Schuljahresende (31.07.')).toBeChecked();
    if (option === 'unbefristet') await expect(this.page.getByLabel('Unbefristet')).toBeChecked();
  }
}
