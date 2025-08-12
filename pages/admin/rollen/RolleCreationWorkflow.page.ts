import { expect, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';
import { RolleCreationSuccessPage } from './RolleCreationSuccess.page';
import { RolleCreationParams } from './RolleCreationView.neu.page';

export class RolleCreationWorkflow extends AbstractAdminPage {
  private readonly rolleForm: RolleForm;

  constructor(page: Page) {
    super(page);
    this.rolleForm = new RolleForm(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
  }

  public async selectAdministrationsebene(ssk: RolleCreationParams['ssk']): Promise<void> {
    await this.rolleForm.adminstrationsebene.inputElement.selectByTitle(ssk);
  }

  public async selectName(name: RolleCreationParams['name']): Promise<void> {
    await this.rolleForm.enterRollenname(name);
  }

  public async selectArt(art: RolleCreationParams['art']): Promise<void> {
    await this.rolleForm.rollenart.inputElement.selectByTitle(art);
  }

  public async selectMerkmale(merkmale: RolleCreationParams['merkmale']): Promise<void> {
    await Promise.all(
      merkmale.map(merkmal => this.rolleForm.merkmale.inputElement.selectByTitle(merkmal))
    );
  }

  public async selectSystemrechte(systemrechte: RolleCreationParams['systemrechte']): Promise<void> {
    await Promise.all(
      systemrechte.map(systemrecht => this.rolleForm.systemrechte.inputElement.selectByTitle(systemrecht))
    );
  }

  public async selectServiceProviders(serviceProviders: RolleCreationParams['serviceProviders']): Promise<void> {
    await Promise.all(
      serviceProviders.map(provider => this.rolleForm.angebote.inputElement.selectByTitle(provider))
    );
  }

  public async selectServiceProvidersByPosition(positions: number[]): Promise<void> {
    await this.rolleForm.angebote.inputElement.selectByPosition(positions);
  }

  public async submit(): Promise<RolleCreationSuccessPage> {
    await this.page.getByTestId('rolle-form-submit-button').click();

    const rolleCreationSuccessPage: RolleCreationSuccessPage = new RolleCreationSuccessPage(this.page);
    await rolleCreationSuccessPage.waitForPageLoad();

    return rolleCreationSuccessPage;
  }

  /* assertions */
  public async checkMessage(label: keyof RolleCreationParams, value: string): Promise<void> {
    switch (label) {
      case 'ssk':
        await expect(this.rolleForm.adminstrationsebene.messages).toHaveText(value);
        break;
      case 'art':
        await expect(this.rolleForm.rollenart.messages).toHaveText(value);
        break;
      case 'name':
        await expect(this.rolleForm.rollenname.messages).toHaveText(value);
        break;
    }
  }
}
