import { expect, type Locator, Page } from '@playwright/test';
import { KlasseDeletionWorkflowPage } from '../deletion-workflow/KlasseDeletionWorkflow.page';
import { KlasseManagementViewPage } from '../KlasseManagementView.neu.page';

export class KlasseDetailsViewPage {
  private readonly deletionWorkflow: KlasseDeletionWorkflowPage;
  /* add global locators here */

  private readonly adminHeadline: Locator = this.page.getByTestId('admin-headline');
  private readonly schuleNameInput : Locator = this.page.getByTestId('klasse-form-schule-select').locator('input');
  private readonly klasseNameInput : Locator = this.page.getByTestId('klassenname-input').locator('input');
  private readonly klasseLoeschenButton : Locator = this.page.getByTestId('open-klasse-delete-dialog-button');
  private readonly klasseBearbeitenButton : Locator = this.page.getByTestId('klasse-edit-button');
  private readonly klasseSpeichernButton : Locator = this.page.getByTestId('klasse-form-submit-button');
  private readonly abbrechenButton : Locator = this.page.getByTestId('klasse-form-discard-button');

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
    await this.klasseBearbeitenButton.waitFor({ state: 'visible' });
    await this.klasseBearbeitenButton.click();

    await this.checkEditForm();

    await this.klasseNameInput.fill(klassenname);
    await this.klasseSpeichernButton.click();
  }

  /* assertions */
  public async checkDetailsForm(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klasse bearbeiten');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();

    await expect(this.page.getByText('1. Schule zuordnen', { exact: false })).toBeVisible();
    await expect(this.schuleNameInput).toBeVisible();

    await expect(this.page.getByText('2. Klassenname eingeben', { exact: false })).toBeVisible();
    await expect(this.klasseNameInput).toBeVisible();

    await expect(this.klasseLoeschenButton).toBeEnabled();
    await expect(this.klasseBearbeitenButton).toBeEnabled();
  }

  public async checkEditForm(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Klasse bearbeiten');
    await expect(this.page.getByText('Mit * markierte Felder sind Pflichtangaben.', { exact: false })).toBeVisible();
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();

    await expect(this.page.getByText('1. Schule zuordnen', { exact: false })).toBeVisible();
    await expect(this.schuleNameInput).toBeVisible();

    await expect(this.page.getByText('2. Klassenname eingeben', { exact: false })).toBeVisible();
    await expect(this.klasseNameInput).toBeVisible();

    await expect(this.klasseSpeichernButton).toBeDisabled();
    await expect(this.abbrechenButton).toBeEnabled();
  }

  public async klasseSuccessfullyEdited(schulname: string, dienststellennummer: string, klassenname: string): Promise<void> {
    await expect(this.page.getByTestId('klasse-success-text')).toHaveText('Die Klasse wurde erfolgreich geändert.');
    await this.page.getByTestId('klasse-success-icon').isVisible();
    await expect(this.page.getByTestId('created-klasse-schule')).toHaveText(`${dienststellennummer} (${schulname})`);
    await expect(this.page.getByTestId('created-klasse-name')).toHaveText(klassenname);
  }
}
