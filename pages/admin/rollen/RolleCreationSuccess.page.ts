import { expect, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';
import { RolleCreationParams } from './RolleCreationView.neu.page';
import { RolleManagementViewPage } from './RolleManagementView.page';

export class RolleCreationSuccessPage extends AbstractAdminPage {
  private readonly rolleForm: RolleForm;

  constructor(protected page: Page) {
    super(page);
    this.rolleForm = new RolleForm(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
  }

  public async backToResultList(): Promise<RolleManagementViewPage> {
    await this.page.getByTestId('back-to-list-button').click();
    return new RolleManagementViewPage(this.page);
  }

  /* assertions */
  public async checkSuccessPage(params: RolleCreationParams): Promise<void> {
    await expect(this.page.getByText('Folgende Daten wurden gespeichert:')).toBeVisible();
    await expect(this.page.getByTestId('rolle-success-text')).toBeVisible();
    await expect(this.page.locator('.mdi-check-circle')).toBeVisible();
    await expect(this.rolleForm.rollenname.label).toBeVisible();
    await expect(this.rolleForm.rollenname.data).toHaveText(params.name);
    await expect(this.rolleForm.adminstrationsebene.label).toBeVisible();
    await expect(this.rolleForm.adminstrationsebene.data).toHaveText(params.ssk);
    await expect(this.rolleForm.rollenart.label).toBeVisible();
    await expect(this.rolleForm.rollenart.data).toHaveText(params.art);
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
