import { expect, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { RolleCreationParams, RolleCreationViewPage } from './RolleCreationView.neu.page';
import { RolleManagementViewPage } from './RolleManagementView.neu.page';

export class RolleCreationSuccessPage {
  private readonly rolleForm: RolleForm;

  constructor(protected readonly page: Page) {
    this.rolleForm = new RolleForm(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<RolleCreationSuccessPage> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
    await expect(this.page.getByTestId('following-rolle-data-created-text')).toHaveText(
      'Folgende Daten wurden gespeichert:'
    );
    await expect(this.page.getByTestId('rolle-success-text')).toBeVisible();
    await expect(this.page.getByTestId('rolle-success-icon')).toBeVisible();
    return this;
  }

  public async backToResultList(): Promise<RolleManagementViewPage> {
    await this.page.getByTestId('back-to-list-button').click();
    return new RolleManagementViewPage(this.page).waitForPageLoad();
  }

  public async createAnother(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('create-another-rolle-button').click();
    return new RolleCreationViewPage(this.page).waitForPageLoad();
  }

  /* assertions */
  public async checkSuccessPage(params: RolleCreationParams): Promise<void> {
    await expect(this.page.getByText('Folgende Daten wurden gespeichert:')).toBeVisible();
    await expect(this.page.getByTestId('rolle-success-text')).toBeVisible();
    await expect(this.page.getByTestId('rolle-success-icon')).toBeVisible();
    await expect(this.rolleForm.rollenname.label).toBeVisible();
    await expect(this.rolleForm.rollenname.data).toHaveText(params.name);
    await expect(this.rolleForm.adminstrationsebene.label).toBeVisible();
    await expect(this.rolleForm.adminstrationsebene.data).toContainText(params.administrationsebene);
    await expect(this.rolleForm.rollenart.label).toBeVisible();
    await expect(this.rolleForm.rollenart.data).toHaveText(params.rollenart);
    await expect(this.rolleForm.merkmale.label).toBeVisible();
    for (const merkmal of params.merkmale) {
      await expect(this.rolleForm.merkmale.data).toContainText(merkmal);
    }
    await expect(this.rolleForm.systemrechte.label).toBeVisible();
    for (const systemrecht of params.systemrechte) {
      await expect(this.rolleForm.systemrechte.data).toContainText(systemrecht);
    }
    await expect(this.rolleForm.angebote.label).toBeVisible();
    for (const provider of params.serviceProviders) {
      await expect(this.rolleForm.angebote.data).toContainText(provider);
    }
    await expect(this.page.getByTestId('create-another-rolle-button')).toBeVisible();
    await expect(this.page.getByTestId('back-to-list-button')).toBeVisible();
  }
}
