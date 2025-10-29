import { expect, Page } from '@playwright/test';
import { RolleCreationSuccessPage } from './RolleCreationSuccess.page';
import { RolleCreationWorkflow } from './RolleCreationWorkflow.page';

/* these rolle creation params are not the same as the API params,
    here we use the displayed texts to select from input elements */
export interface RolleCreationParams {
  name: string;
  schulname: string;
  rollenart: string;
  merkmale: string[];
  systemrechte: string[];
  serviceProviders: string[];
}

export class RolleCreationViewPage {
  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('rolle-creation-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
  }

  public startRolleCreationWorkflow(): RolleCreationWorkflow {
    return new RolleCreationWorkflow(this.page);
  }

  public async createRolle(params: RolleCreationParams): Promise<RolleCreationSuccessPage> {
    const workflow: RolleCreationWorkflow = this.startRolleCreationWorkflow();
    await workflow.selectAdministrationsebene(params.schulname);
    await workflow.selectArt(params.rollenart);
    await workflow.selectName(params.name);
    await workflow.selectMerkmale(params.merkmale);
    await workflow.selectSystemrechte(params.systemrechte);
    await workflow.selectServiceProviders(params.serviceProviders);
    return workflow.submit();
  }

  /* assertions */
}
