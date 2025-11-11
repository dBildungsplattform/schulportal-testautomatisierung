import { expect, type Locator, Page } from '@playwright/test';
import { KlasseDeletionWorkflowPage } from '../deletion-workflow/KlasseDeletionWorkflow.page';
import { KlasseManagementViewPage } from '../KlasseManagementView.neu.page';

export class KlasseDetailsViewPage {
  private readonly deletionWorkflow: KlasseDeletionWorkflowPage;
  /* add global locators here */

  constructor(protected readonly page: Page) {
    this.deletionWorkflow = new KlasseDeletionWorkflowPage(page, this);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('klasse-details-headline')).toBeVisible();
    await expect(this.page.getByTestId('klasse-details-headline')).toHaveText('Klasse bearbeiten');
  }

  public async successfullyDeleteKlasse(schulname: string, klassenname: string): Promise<KlasseManagementViewPage> {
    await this.deletionWorkflow.deleteKlasse(schulname, klassenname);
    const klasseManagementViewPage: KlasseManagementViewPage = await this.deletionWorkflow.klasseSuccessfullyDeleted(schulname, klassenname);
    return klasseManagementViewPage;
  }

  public async unsuccessfullyDeleteKlasse(schulname: string, klassenname: string): Promise<KlasseManagementViewPage | KlasseDetailsViewPage> {
    await this.deletionWorkflow.deleteKlasse(schulname, klassenname);
    return await this.deletionWorkflow.klasseDeletionFailed();
  }


  public async editKlasse(klassenname: string): Promise<void> {
    const klasseNameInput: Locator = this.page.getByTestId('klassenname-input');
    const editKlasseButton: Locator = this.page.getByTestId('klasse-edit-button');
    const editKlasseSubmitButton: Locator = this.page.getByTestId('klasse-form-submit-button');

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
