import { expect, type Page } from '@playwright/test';
import { Autocomplete } from '../../../../../elements/Autocomplete';
import { BaseWorkflowPage, TestIdsType } from './BaseWorkflow.page';

export class AddZuordnungWorkflowPage extends BaseWorkflowPage {
  /* add global locators here */
  private readonly organisationen: Autocomplete;
  private readonly rollen: Autocomplete;
  protected readonly ENDPOINT: string = 'personenkontext-workflow/**';
  
  protected readonly TEST_IDS: TestIdsType = {
    submitButton: 'zuordnung-creation-submit-button',
    confirmButton: 'confirm-zuordnung-dialog-addition',
    discardButton: 'zuordnung-creation-discard-button',
    closeSuccessDialog: 'change-klasse-success-dialog-close-button',
    klasseSelect: 'personenkontext-create-klasse-select',
  } as const;

  constructor(protected readonly page: Page) {
    super(page);
    this.organisationen = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-organisation-select'));
    this.rollen = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
  }

  /* actions */
  public async selectOrganisation(organisation: string): Promise<void> {
    await this.organisationen.searchByTitle(organisation, false);
  }

  public async selectRolle(rolle: string): Promise<void> {
    await this.rollen.searchByTitle(rolle, true, this.ENDPOINT);
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
}
