import { expect, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../../abstracts/AbstractAdminPage.page';
import { KlasseDeletionWorkflowPage } from '../deletion-workflow/KlasseDeletionWorkflow.page';
import { KlasseManagementViewPage } from '../KlasseManagementView.neu.page';

export class KlasseDetailsViewPage extends AbstractAdminPage {
  private readonly deletionWorkflow: KlasseDeletionWorkflowPage;
  /* add global locators here */

  constructor(page: Page) {
    super(page);
    this.deletionWorkflow = new KlasseDeletionWorkflowPage(page, this);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-card')).toBeVisible();
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klasse bearbeiten');
  }

  public async successfullyDeleteKlasse(schulname: string, klassenname: string): Promise<KlasseManagementViewPage> {
    await this.deletionWorkflow.deleteKlasse(schulname, klassenname);
    const klasseManagementViewPage = await this.deletionWorkflow.klasseSuccessfullyDeleted(schulname, klassenname);
    return klasseManagementViewPage;
  }

  public async unsuccessfullyDeleteKlasse(schulname: string, klassenname: string): Promise<KlasseManagementViewPage | KlasseDetailsViewPage> {
    await this.deletionWorkflow.deleteKlasse(schulname, klassenname);
    return await this.deletionWorkflow.klasseDeletionFailed();
  }


  public async editKlasse(klassenname: string): Promise<void> {
    const klasseNameInput = this.page.getByTestId('klassenname-input');
    const editKlasseButton = this.page.getByTestId('klasse-edit-button');
    const editKlasseSubmitButton = this.page.getByTestId('klasse-form-submit-button');

    await editKlasseButton.waitFor({ state: 'visible' });
    await editKlasseButton.click();

    await klasseNameInput.waitFor({ state: 'visible' });
    await klasseNameInput.fill(klassenname);

    await editKlasseSubmitButton.waitFor({ state: 'visible' });
    await editKlasseSubmitButton.click();
  }

  /* assertions */
  public async klasseSuccessfullyEdited(schulname: string, dienststellennummer: string, klassenname: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-success-text')).toHaveText('Die Klasse wurde erfolgreich geändert.');
    await this.page.getByTestId('klasse-success-icon').isVisible();
    await expect(this.page.getByTestId('created-klasse-schule')).toHaveText(`(${dienststellennummer}) ${schulname}`);
    await expect(this.page.getByTestId('created-klasse-name')).toHaveText(klassenname);
  }
}
