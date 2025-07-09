import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';

export class KlasseDetailsViewPage {
  /* locators */
  readonly page: Page;
  readonly schuleNameAutocomplete: Autocomplete;
  readonly klasseNameInput: Locator;
  readonly klasseDeletionButton: Locator;
  readonly klasseEditButton: Locator;
  readonly discardChangesButton: Locator;
  readonly saveChangesButton: Locator;
  readonly klasseDetailsErrorAlertText: Locator;
  readonly klasseDetailsErrorAlertButton: Locator;
  readonly klasseDeletionDialogText: Locator;
  readonly klasseDeletionDialogCancelButton: Locator;
  readonly klasseDeletionDialogConfirmButton: Locator;
  readonly klasseDeletionSuccessText: Locator;
  readonly closeDeletionSuccessButton: Locator;
  readonly successText: Locator;
  readonly successIcon: Locator;
  readonly savedDataSchuleText: Locator;
  readonly savedDataKlasseText: Locator;
  readonly backToListButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    /* details view Klasse */
    this.page = page;
    this.schuleNameAutocomplete = new Autocomplete(this.page, page.getByTestId('schule-select'));
    this.klasseNameInput = page.getByTestId('klassenname-input');
    this.klasseDeletionButton = page.getByTestId('open-klasse-delete-dialog-button');
    this.klasseEditButton = page.getByTestId('klasse-edit-button');
    this.discardChangesButton = page.getByTestId('klasse-form-discard-button');
    this.saveChangesButton = page.getByTestId('klasse-form-submit-button');
    this.klasseDetailsErrorAlertText = page.getByTestId('klasse-details-error-alert-text');
    this.klasseDetailsErrorAlertButton = page.getByTestId('klasse-details-error-alert-button');

    /* delete Klasse dialog */
    this.klasseDeletionDialogText = page.getByTestId('klasse-delete-confirmation-text');
    this.klasseDeletionDialogCancelButton = page.getByTestId('cancel-klasse-delete-dialog-button');
    this.klasseDeletionDialogConfirmButton = page.getByTestId('klasse-delete-button');
    this.closeDeletionSuccessButton = page.getByTestId('close-klasse-delete-success-dialog-button');
    this.klasseDeletionSuccessText = page.getByTestId('klasse-delete-success-text');

    /* success template Klasse */
    this.successText = page.getByTestId('klasse-success-text');
    this.successIcon = page.getByTestId('klasse-success-icon');
    this.savedDataSchuleText = page.getByTestId('created-klasse-schule');
    this.savedDataKlasseText = page.getByTestId('created-klasse-name');
    this.backToListButton = page.getByTestId('back-to-list-button');
    this.closeButton = page.getByTestId('close-layout-card-button');
  }

  /* actions */
  public async editKlasse(klassenname: string): Promise<void> {
    await this.klasseEditButton.click();
    await this.klasseNameInput.fill(klassenname);
    await this.saveChangesButton.click();
  }

  public async deleteKlasse(klassenname: string, schulname: string): Promise<void> {
    await this.klasseDeletionButton.click();
    await expect(this.klasseDeletionDialogText).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await this.klasseDeletionDialogConfirmButton.click();
  }

  /* assertions */
  public async klasseSuccessfullyEdited(schulname: string, dienststellennummer: string, klassenname: string): Promise<void> {
    await expect(this.successText).toHaveText('Die Klasse wurde erfolgreich geändert.');
    await this.successIcon.isVisible();
    await expect(this.savedDataSchuleText).toHaveText(`(${dienststellennummer}) ${schulname}`);
    await expect(this.savedDataKlasseText).toHaveText(klassenname);
  }

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<void> {
    await expect(this.klasseDeletionSuccessText).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await this.closeDeletionSuccessButton.click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    await expect(this.klasseDetailsErrorAlertText).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await this.klasseDetailsErrorAlertButton.click();
  }
}
