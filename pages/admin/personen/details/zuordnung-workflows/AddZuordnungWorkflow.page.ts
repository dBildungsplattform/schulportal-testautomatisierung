import { expect, type Page } from '@playwright/test';
import { Autocomplete } from '../../../../../elements/Autocomplete';
import { ZuordnungenPage } from '../Zuordnungen.page';

export class AddZuordnungWorkflowPage {
  /* locators */
  readonly page: Page;
  private readonly organisationen: Autocomplete;
  private readonly rollen: Autocomplete;

  constructor(page: Page) {
    this.page = page;
    this.organisationen = new Autocomplete(this.page, this.page.getByTestId('organisation-select'));
    this.rollen = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
  }

  /* actions */
  public async submit(): Promise<ZuordnungenPage> {
    await this.page.getByTestId('zuordnung-creation-submit-button').click();
    await this.page.getByRole('button', { name: 'Ja' }).click();
    return new ZuordnungenPage(this.page);
  }

  public async selectOrganisation(organisation: string): Promise<void> {
    await this.organisationen.searchByTitle(organisation, true);
  }

  public async selectRolle(rolle: string): Promise<void> {
    await this.rollen.searchByTitle(rolle, true, 'personenkontext-workflow/**');
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
