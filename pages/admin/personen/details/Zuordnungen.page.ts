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

export interface ZuordnungValidationParams {
  organisation: string;
  dstNr?: string;
  rolle?: string;
  klasse?: string;
  befristung?: string;
  status?: 'unchanged' | 'delete' | 'create';
}

export class ZuordnungenPage {
  public constructor(private readonly page: Page, private readonly addZuordnungWorkflowFactory: (page: Page) => AddZuordnungWorkflowPage = p => new AddZuordnungWorkflowPage(p),
                     private readonly befristungWorkflowFactory: (page: Page) => BefristungWorkflowPage = p => new BefristungWorkflowPage(p)
  ) {
  }

  /* actions */
  public async editZuordnungen(): Promise<void> {
    await this.page.getByTestId('zuordnung-edit-button').click();
  }

  public async selectZuordnungToEdit(params: ZuordnungValidationParams): Promise<void> {
    const expectedText: string = this.buildExpectedTextForZuordnung(params);
    await this.page.getByTestId('person-zuordnungen-section-edit').getByText(expectedText).click();
  }

  public async startAddZuordnungWorkflow(): Promise<AddZuordnungWorkflowPage> {
    await this.page.getByTestId('zuordnung-create-button').click();
    return this.addZuordnungWorkflowFactory(this.page);
  }

  public async startBefristungWorkflow(): Promise<BefristungWorkflowPage> {
    await this.page.getByTestId('befristung-change-button').click();
    return this.befristungWorkflowFactory(this.page);
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
      await workflowPage.fillBefristungInput(params.befristung);
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
    await expect(this.page.getByTestId('change-klasse-confirmation-dialog-text')).toContainText(
      `Wollen Sie den Schüler/die Schülerin aus Klasse ${from} in Klasse ${to} versetzen?`
    );
    await this.page.getByTestId('confirm-change-klasse-button').click();
    await this.savePendingChanges();
  }

  private async savePendingChanges(): Promise<void> {
    await this.page.getByTestId('zuordnung-changes-save-button').click();
    await this.page.getByTestId('change-klasse-success-dialog-close-button').click();
  }

  private buildExpectedTextForZuordnung(params: ZuordnungValidationParams): string {
    let expectedText: string = '';
    if (params.dstNr) {
      expectedText += `${params.dstNr} (${params.organisation}):`;
    } else {
      expectedText += `${params.organisation}:`;
    }
    if (params.rolle) {
      expectedText += ` ${params.rolle}`;
    }
    if(params.klasse) {
      expectedText += ` ${params.klasse}`;
    }
    if (params.befristung) {
      expectedText += ` (befristet bis ${params.befristung})`;
    }
    if (params.status) {
      switch (params.status) {
        case 'unchanged':
          break;
        case 'delete':
          expectedText += ' (wird entfernt)';
          break;
        case 'create':
          expectedText += ' (wird hinzugefügt)';
          break;
      }
    }
    return expectedText;
  }

  /* assertions */
  public async checkSelectedBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    const workflowPage: BefristungWorkflowPage = await this.startBefristungWorkflow();
    await workflowPage.checkSelectedBefristungOption(option);
  }

  public async checkZuordnungExists(params: ZuordnungValidationParams): Promise<void> {
    const expectedText: string = this.buildExpectedTextForZuordnung(params);
    await expect(this.page.getByTestId('person-zuordnungen-section-view')).toContainText(expectedText);
  }

  public async checkPendingZuordnungen(params: ZuordnungValidationParams): Promise<void> {
    const expectedText: string = this.buildExpectedTextForZuordnung(params);

    switch (params.status) {
      case 'unchanged':
        await expect(this.page.getByTestId('person-zuordnungen-section-edit')).toContainText(expectedText);
        break;
      case 'delete':
        await expect(this.page.getByTestId('person-zuordnungen-section-edit').locator('span.text-green')).toContainText(expectedText);
        break;
      case 'create':
        await expect(this.page.getByTestId('person-zuordnungen-section-edit').locator('span.text-red')).toContainText(expectedText);
        break;
    }
  }
}
