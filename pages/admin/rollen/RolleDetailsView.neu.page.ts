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
    const rolleNameInput = this.page.getByTestId('rollenname-input');
    const editRolleButton = this.page.getByTestId('rolle-edit-button');
    const editRolleSubmitButton = this.page.getByTestId('rolle-changes-save-button');

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
    await this.page.getByTestId('rolle-success-icon').isVisible();
    await expect(this.page.getByTestId('updated-rolle-name')).toHaveText(rollenname);
  }
}
