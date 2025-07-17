import { expect, Page } from '@playwright/test';
import { Autocomplete } from '../../../../elements/Autocomplete';
import { AddZuordnungWorkflowPage } from './zuordnung-workflows/AddZuordnungWorkflow.page';
import { BefristungWorkflowPage } from './zuordnung-workflows/BefristungWorkflow.page';

export interface ZuordnungCreationParams {
  rolle: string;
  organisation?: string;
  prefilledOrganisation?: string;
  kopers?: string;
  befristung?: string;
}
export interface ZuordnungValidationParams { organisation: string; dstNr?: string; rolle?: string; befristung?: string }
export type PendingZuordnungValidationParams = ZuordnungValidationParams & {
  status: 'unchanged' | 'delete' | 'create';
};

export class ZuordnungenPage {
  public constructor(private readonly page: Page) {}

  /* actions */
  public async editZuordnungen(): Promise<void> {
    await this.page.getByTestId('zuordnung-edit-button').click();
  }

  public async selectZuordnungToEdit(params: ZuordnungValidationParams): Promise<void> {
    const expectedText: string = this.buildExpectedTextForZuordnung(params);
    await this.page.getByTestId('person-details-card').getByText(expectedText).click();
  }

  public async startAddZuordnungWorkflow(): Promise<AddZuordnungWorkflowPage> {
    await this.page.getByTestId('zuordnung-create-button').click();
    return new AddZuordnungWorkflowPage(this.page);
  }

  public async startBefristungWorkflow(): Promise<BefristungWorkflowPage> {
    await this.page.getByTestId('befristung-change-button').click();
    return new BefristungWorkflowPage(this.page);
  }

  public async addZuordnung(params: ZuordnungCreationParams): Promise<void> {
    const workflowPage: AddZuordnungWorkflowPage = await this.startAddZuordnungWorkflow();

    if (params.organisation) await workflowPage.selectOrganisation(params.organisation);
    await workflowPage.selectRolle(params.rolle);
    if (params.kopers) await workflowPage.fillKopers(params.kopers);
    if (params.befristung) await workflowPage.fillBefristung(params.befristung);
    await workflowPage.submit();
    await this.savePendingChanges();
  }

  public async editBefristung(
    params: { option: 'unbefristet' | 'schuljahresende' } | { befristung: string }
  ): Promise<void> {
    const workflowPage: BefristungWorkflowPage = await this.startBefristungWorkflow();
    if ('option' in params) {
      await workflowPage.selectBefristungOption(params.option);
    }
    if ('befristung' in params) {
      await workflowPage.fill(params.befristung);
    }
    await workflowPage.submit();
    await this.savePendingChanges();
  }

  public async changeKlasse(from: string, to: string): Promise<void> {
    const autocomplete: Autocomplete = new Autocomplete(
      this.page,
      this.page.getByTestId('klasse-change-klasse-select')
    );

    await this.editZuordnungen();
    await this.selectZuordnungToEdit({ organisation: from });

    await this.page.getByTestId('klasse-change-button').click();
    await autocomplete.searchByTitle(to, false);
    await this.page.getByTestId('klasse-change-submit-button').click();
    await expect(this.page.getByRole('dialog')).toContainText(
      `Wollen Sie den Schüler/die Schülerin aus Klasse ${from} in Klasse ${to} versetzen?`
    );
    await this.page.getByTestId('confirm-change-klasse-button').click();
    this.savePendingChanges();
    // await this.page.getByTestId('zuordnung-changes-save').click();
    // await this.page.getByTestId('change-klasse-success-close').click();
  }

  private async savePendingChanges(): Promise<void> {
    await this.page.getByTestId('zuordnung-changes-save').click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Schließen' }).click();
  }

  private buildExpectedTextForZuordnung(params: ZuordnungValidationParams): string {
    let expectedText = '';
    if (params.dstNr) {
      expectedText += `${params.dstNr} (${params.organisation}): `;
    } else {
      expectedText += `${params.organisation}: `;
    }
    if (params.rolle) {
      expectedText += `${params.rolle} `;
    }
    if (params.befristung) {
      expectedText += `(befristet bis ${params.befristung})`;
    }
    return expectedText;
  }

  /* assertions */
  public async checkZuordnungExists(params: ZuordnungValidationParams): Promise<void> {
    const expectedText: string = this.buildExpectedTextForZuordnung(params);
    await expect(this.page.getByTestId('person-details-card')).toContainText(expectedText);
  }
}
