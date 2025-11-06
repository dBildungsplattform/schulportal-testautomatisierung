import { expect, type Locator, Page } from '@playwright/test';
import { RolleCreationParams } from './RolleCreationView.neu.page';
import { RolleForm } from '../../../components/RolleForm';

export class RolleDetailsViewPage {

  constructor(protected readonly page: Page) { }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('rolle-details-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Rolle bearbeiten');
  }

  public async editRolle(rollenname: string): Promise<void> {
    const rolleNameInput: Locator = this.page.getByTestId('rollenname-input');
    const editRolleButton: Locator = this.page.getByTestId('rolle-edit-button');
    const editRolleSubmitButton: Locator = this.page.getByTestId('rolle-changes-save-button');

    await editRolleButton.waitFor({ state: 'visible' });
    await editRolleButton.click();

    await rolleNameInput.waitFor({ state: 'visible' });
    await rolleNameInput.fill(rollenname);

    await editRolleSubmitButton.waitFor({ state: 'visible' });
    await editRolleSubmitButton.click();
  }

  /* assertions */
  public async rolleSuccessfullyEdited(rollenname: string): Promise<void> {
    await expect(this.page.getByTestId('rolle-success-text')).toHaveText('Die Rolle wurde erfolgreich geändert.');
    await expect(this.page.getByTestId('rolle-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('updated-rolle-name')).toHaveText(rollenname);
  }

  public async checkGesamtuebersicht(params: RolleCreationParams): Promise<void> {
    await expect(this.page.getByTestId('rolle-form-organisation-select')).toContainText(params.administrationsebene);

    await expect(this.page.getByTestId('rollenart-select')).toContainText(params.rollenart);

    await expect(this.page.locator('#rollenname-input')).toHaveValue(params.name);

    for (const merkmal of params.merkmale) {
      await expect(this.page.getByTestId('merkmale-select')).toContainText(merkmal);
    }

    for (const systemrecht of params.systemrechte) {
      await expect(this.page.getByTestId('systemrechte-select')).toContainText(systemrecht);
    }

    for (const provider of params.serviceProviders) {
      await expect(this.page.getByTestId('service-provider-select')).toContainText(provider);
    }

    await expect(this.page.getByTestId('open-rolle-delete-dialog-button')).toBeVisible();
    await expect(this.page.getByTestId('rolle-edit-button')).toBeVisible();
  }
}
