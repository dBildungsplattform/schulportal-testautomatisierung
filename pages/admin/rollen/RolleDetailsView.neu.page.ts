import { expect, type Locator, Page } from '@playwright/test';

export class RolleDetailsViewPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('rolle-details-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('rolle-details-headline')).toHaveText('Rolle bearbeiten');
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
}
