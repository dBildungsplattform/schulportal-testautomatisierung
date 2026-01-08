import { expect, Locator, type Page } from '@playwright/test';
import { Autocomplete } from '../../../../../elements/Autocomplete';
import { ZuordnungenPage } from '../Zuordnungen.page';
import { waitForAPIResponse } from '../../../../../base/api/baseApi';

export class AddZuordnungWorkflowPage {
  /* add global locators here */
  private readonly organisationen: Autocomplete;
  private readonly rollen: Autocomplete;
  private static readonly ENDPOINT: string = 'personenkontext-workflow/**';

  constructor(protected readonly page: Page) {
    this.organisationen = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-organisation-select'));
    this.rollen = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
  }

  /* actions */
  public async submit(): Promise<ZuordnungenPage> {
    await this.page.getByTestId('zuordnung-creation-submit-button').click();
    await this.page.getByTestId('confirm-zuordnung-dialog-addition').click();
    await waitForAPIResponse(this.page, AddZuordnungWorkflowPage.ENDPOINT);
    return new ZuordnungenPage(this.page);
  }

  public async discard(): Promise<ZuordnungenPage> {
    await this.page.getByTestId('zuordnung-creation-discard-button').click();
    return new ZuordnungenPage(this.page);
  }

  public async selectOrganisation(organisation: string): Promise<void> {
    await this.organisationen.searchByTitle(organisation, false);
  }

  public async selectRolle(rolle: string): Promise<void> {
    await this.rollen.searchByTitle(rolle, true, AddZuordnungWorkflowPage.ENDPOINT);
  }

  public async fillKopers(kopers: string): Promise<void> {
    await this.page.getByTestId('kopersnr-input').locator('input').fill(kopers);
  }

  public async fillBefristung(befristung: string): Promise<void> {
    await this.page.getByTestId('befristung-input').locator('input').fill(befristung);
  }

  /* assertions */
  public async checkSelectedOrganisation(organisation: string): Promise<void> {
    await this.organisationen.checkText(organisation);
  }

  public async checkSelectedBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    if (option === 'schuljahresende') await expect(this.page.getByLabel('Bis Schuljahresende (31.07.')).toBeChecked();
    if (option === 'unbefristet') await expect(this.page.getByLabel('Unbefristet')).toBeChecked();
  }

  public async checkKlasseDropdownVisibleAndClickable(items: string[]): Promise<void> {   
    const sortedItems: string[] = [...items].sort((a: string, b: string) => a.localeCompare(b, 'de', { numeric: true }));
    for (const item of sortedItems) {
      await this.page.getByTestId('personenkontext-create-klasse-select').click();
      const option: Locator = this.page.getByRole('option', { name: item, exact: false });
      await option.scrollIntoViewIfNeeded();
      await expect(option).toBeVisible();
      await option.click();
    }
  }

}
