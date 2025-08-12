import { expect, type Page } from '@playwright/test';
import { KlasseManagementViewPage } from '../KlasseManagementView.page';
import { KlasseDetailsViewPage } from '../details/KlasseDetailsView.neu.page';

export class KlasseDeletionWorkflowPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  /* actions */
  public async deleteKlasse(klassenname: string, schulname: string): Promise<void> {
    await this.page.getByTestId('open-klasse-delete-dialog-button').click();
    await expect(this.page.getByTestId('klasse-delete-confirmation-text')).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await this.page.getByTestId('klasse-delete-button').click();
  }

  /* assertions */
  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<KlasseManagementViewPage> {
    await expect(this.page.getByTestId('klasse-delete-success-text')).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await this.page.getByTestId('close-klasse-delete-success-dialog-button').click();
    return new KlasseManagementViewPage(this.page);
  }

  public async klasseDeletionFailed(): Promise<KlasseManagementViewPage | KlasseDetailsViewPage> {
    await expect(this.page.getByTestId('klasse-details-error-alert-text')).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await this.page.getByTestId('klasse-details-error-alert-button').click();
  }
}