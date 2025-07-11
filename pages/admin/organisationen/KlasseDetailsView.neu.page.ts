import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../AbstractAdminPage.page';

export class KlasseDetailsViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-card')).toBeVisible();
  }

  public async editKlasse(klassenname: string): Promise<void> {
    const klasseEditButton: Locator = this.page.getByTestId('klasse-edit-button');
    const klasseNameInput: Locator = this.page.getByTestId('klassenname-input');
    const saveChangesButton: Locator = this.page.getByTestId('klasse-form-submit-button');

    await klasseEditButton.click();
    await klasseNameInput.fill(klassenname);
    await saveChangesButton.click();
  }

  public async deleteKlasse(klassenname: string, schulname: string): Promise<void> {
    const klasseDeletionButton: Locator = this.page.getByTestId('open-klasse-delete-dialog-button');
    const klasseDeletionDialogText: Locator = this.page.getByTestId('klasse-delete-confirmation-text');
    const klasseDeletionDialogConfirmButton: Locator = this.page.getByTestId('klasse-delete-button');

    await klasseDeletionButton.click();
    await expect(klasseDeletionDialogText).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await klasseDeletionDialogConfirmButton.click();
  }

  /* assertions */
  public async klasseSuccessfullyEdited(schulname: string, dienststellennummer: string, klassenname: string): Promise<void> {
    const successText: Locator = this.page.getByTestId('klasse-success-text');
    const successIcon: Locator = this.page.getByTestId('klasse-success-icon');
    const savedDataSchuleText: Locator = this.page.getByTestId('created-klasse-schule');
    const savedDataKlasseText: Locator = this.page.getByTestId('created-klasse-name');

    await expect(successText).toHaveText('Die Klasse wurde erfolgreich geändert.');
    await successIcon.isVisible();
    await expect(savedDataSchuleText).toHaveText(`(${dienststellennummer}) ${schulname}`);
    await expect(savedDataKlasseText).toHaveText(klassenname);
  }

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<void> {
    const closeDeletionSuccessButton: Locator = this.page.getByTestId('close-klasse-delete-success-dialog-button');
    const klasseDeletionSuccessText: Locator = this.page.getByTestId('klasse-delete-success-text');

    await expect(klasseDeletionSuccessText).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await closeDeletionSuccessButton.click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    const klasseDetailsErrorAlertText: Locator = this.page.getByTestId('klasse-details-error-alert-text');
    const klasseDetailsErrorAlertButton: Locator = this.page.getByTestId('klasse-details-error-alert-button');

    await expect(klasseDetailsErrorAlertText).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await klasseDetailsErrorAlertButton.click();
  }
}
