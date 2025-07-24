import { expect, type Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';

export class RolleDetailsViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('rolle-details-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Rolle bearbeiten');
  }

  public async editRolle(rollenname: string): Promise<void> {
    const rolleEditButton: Locator = this.page.getByTestId('rolle-edit-button');
    const rolleNameInput: Locator = this.page.getByTestId('rollenname-input');
    const saveChangesButton: Locator = this.page.getByTestId('rolle-changes-save-button');

    await rolleEditButton.click();
    await rolleNameInput.fill(rollenname);
    await saveChangesButton.click();
  }

  /* assertions */
  public async rolleSuccessfullyEdited(rollenname: string): Promise<void> {
    const successText: Locator = this.page.getByTestId('rolle-success-text');
    const successIcon: Locator = this.page.getByTestId('rolle-success-icon');
    const savedDataRolleText: Locator = this.page.getByTestId('updated-rolle-name');

    await expect(successText).toHaveText('Die Rolle wurde erfolgreich geändert.');
    await successIcon.isVisible();
    await expect(savedDataRolleText).toHaveText(rollenname);
  }
}
