import { expect, type Locator, Page } from '@playwright/test';
import { Alert } from '../../../elements/Alert';
import { RolleCreationParams } from './RolleCreationView.page';
import { RolleManagementViewPage } from './RolleManagementView.page';


export class RolleDetailsViewPage {
  constructor(protected readonly page: Page) {}

  /* globale Lokatoren */
  private readonly organisationSelect: Locator = this.page.getByTestId('rolle-form-organisation-select');
  private readonly rollenartSelect: Locator = this.page.getByTestId('rollenart-select');
  private readonly rollennameInput: Locator = this.page.getByTestId('rollenname-input').locator('input');
  private readonly merkmaleSelect: Locator = this.page.getByTestId('merkmale-select');
  private readonly serviceProviderSelect: Locator = this.page.getByTestId('service-provider-select');
  private readonly systemrechteSelect: Locator = this.page.getByTestId('systemrechte-select');
  private readonly deleteButton: Locator = this.page.getByTestId('open-rolle-delete-dialog-button');
  private readonly editButton: Locator = this.page.getByTestId('rolle-edit-button');
  private readonly editSubmitButton: Locator = this.page.getByTestId('rolle-changes-save-button');
  private readonly deleteConfirmText: Locator = this.page.getByTestId('rolle-delete-confirmation-text');
  private readonly deleteConfirmButton: Locator = this.page.getByTestId('rolle-delete-button');
  private readonly deleteSuccessCloseButton: Locator = this.page.getByTestId('close-rolle-delete-success-dialog-button');
  private readonly successText: Locator = this.page.getByTestId('rolle-success-text');
  private readonly successIcon: Locator = this.page.getByTestId('rolle-success-icon');
  private readonly updatedRolleName: Locator = this.page.getByTestId('updated-rolle-name');

  /* actions */
  public async waitForPageLoad(): Promise<RolleDetailsViewPage> {
    await expect(this.page.getByTestId('rolle-details-headline')).toHaveText('Rolle bearbeiten');
    return this;
  }

  public async editRolle(rollenname: string): Promise<void> {
    await this.editButton.waitFor({ state: 'visible' });
    await this.editButton.click();

    await this.rollennameInput.waitFor({ state: 'visible' });
    await this.rollennameInput.fill(rollenname);

    await this.editSubmitButton.waitFor({ state: 'visible' });
    await this.editSubmitButton.click();
  }

  public async deleteRolle(): Promise<RolleManagementViewPage> {
    await this.clickDeleteAndConfirm();
    await this.deleteSuccessCloseButton.click();
    return new RolleManagementViewPage(this.page).waitForPageLoad();
  }

  public async attemptDeletionOfAssignedRolle(): Promise<Alert<RolleManagementViewPage>> {
    await this.clickDeleteAndConfirm();
    const alert: Alert<RolleManagementViewPage> = new Alert<RolleManagementViewPage>(
      this.page,
      {
        title: 'Löschen nicht möglich',
        text: 'Die Rolle kann nicht gelöscht werden, da sie noch Benutzern zugeordnet ist. Nehmen Sie bitte zunächst alle Zuordnungen zurück.',
        button: 'Zurück zur Ergebnisliste',
      },
      new RolleManagementViewPage(this.page),
      {
        title: 'rolle-details-error-alert-title',
        text: 'rolle-details-error-alert-text',
        button: 'rolle-details-error-alert-button',
      }
    );
    return alert;
  }

  private async clickDeleteAndConfirm(): Promise<void> {
    await this.deleteButton.click();
    await expect(this.deleteConfirmText).toHaveText('Wollen Sie die Rolle sofort und endgültig löschen?');
    await this.deleteConfirmButton.click();
  }

  /* assertions */
  public async rolleSuccessfullyEdited(rollenname: string): Promise<void> {
    await expect(this.successText).toHaveText('Die Rolle wurde erfolgreich geändert.');
    await expect(this.successIcon).toBeVisible();
    await expect(this.updatedRolleName).toHaveText(rollenname);
  }

  public async checkGesamtuebersicht(params: RolleCreationParams): Promise<void> {
    await expect(this.organisationSelect).toContainText(params.administrationsebene);

    await expect(this.rollenartSelect).toContainText(params.rollenart);

    await expect(this.rollennameInput).toHaveValue(params.name);
    for (const merkmal of params.merkmale) {
      await expect(this.merkmaleSelect).toContainText(merkmal);
    }

    for (const systemrecht of params.systemrechte) {
      await expect(this.systemrechteSelect).toContainText(systemrecht);
    }

    for (const provider of params.serviceProviders) {
      await expect(this.serviceProviderSelect).toContainText(provider);
    }

    await expect(this.deleteButton).toBeVisible();
    await expect(this.editButton).toBeVisible();
  }
}
