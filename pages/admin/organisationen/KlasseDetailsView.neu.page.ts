import { expect, type Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';

export class KlasseDetailsViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-card')).toBeVisible();
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klasse bearbeiten');
  }

  public async editKlasse(klassenname: string): Promise<void> {
    await this.page.getByTestId('klasse-edit-button').click();
    await this.page.getByTestId('klassenname-input').fill(klassenname);
    await this.page.getByTestId('klasse-form-submit-button').click();
  }

  public async deleteKlasse(klassenname: string, schulname: string): Promise<void> {
    await this.page.getByTestId('open-klasse-delete-dialog-button').click();
    await expect(this.page.getByTestId('klasse-delete-confirmation-text')).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await this.page.getByTestId('klasse-delete-button').click();
  }

  /* assertions */
  public async klasseSuccessfullyEdited(schulname: string, dienststellennummer: string, klassenname: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-success-text')).toHaveText('Die Klasse wurde erfolgreich geändert.');
    await this.page.getByTestId('klasse-success-icon').isVisible();
    await expect(this.page.getByTestId('created-klasse-schule')).toHaveText(`(${dienststellennummer}) ${schulname}`);
    await expect(this.page.getByTestId('created-klasse-name')).toHaveText(klassenname);
  }

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-delete-success-text')).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await this.page.getByTestId('close-klasse-delete-success-dialog-button').click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-error-alert-text')).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await this.page.getByTestId('klasse-details-error-alert-button').click();
  }
}
