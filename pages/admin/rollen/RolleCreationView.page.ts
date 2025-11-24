import { expect, Page } from '@playwright/test';
import { Alert } from '../../../elements/Alert';
import { MenuBarPage } from '../../components/MenuBar.neu.page';
import { RolleCreationSuccessPage } from './RolleCreationSuccess.page';
import { RolleCreationWorkflow } from './RolleCreationWorkflow.page';

/* these rolle creation params are not the same as the API params,
    here we use the displayed texts to select from input elements */
export interface RolleCreationParams {
  name: string;
  administrationsebene: string;
  rollenart: string;
  merkmale: string[];
  systemrechte: string[];
  serviceProviders: string[];
}

export class RolleCreationViewPage {
  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('rolle-creation-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
    return this;
  }

  public startRolleCreationWorkflow(): RolleCreationWorkflow {
    return new RolleCreationWorkflow(this.page);
  }

  public async createRolle(params: RolleCreationParams): Promise<RolleCreationSuccessPage> {
    const workflow: RolleCreationWorkflow = await this.fillRolleForm(params);
    return workflow.submit();
  }

  public async createRolleWithDuplicateNameError(params: RolleCreationParams): Promise<Alert<RolleCreationViewPage>> {
    const workflow: RolleCreationWorkflow = await this.fillRolleForm(params);
    return workflow.submitWithDuplicateNameError();
  }

  private async fillRolleForm(params: RolleCreationParams): Promise<RolleCreationWorkflow> {
    const workflow: RolleCreationWorkflow = this.startRolleCreationWorkflow();
    await workflow.selectAdministrationsebene(params.administrationsebene);
    await workflow.selectArt(params.rollenart);
    await workflow.selectName(params.name);
    await workflow.selectMerkmale(params.merkmale);
    await workflow.selectSystemrechte(params.systemrechte);
    await workflow.selectServiceProviders(params.serviceProviders);
    return workflow;
  }
  /* assertions */
}
