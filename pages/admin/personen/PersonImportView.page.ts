import { Download, expect, Page } from '@playwright/test';
import { Autocomplete } from '../../components/Autocomplete';
import { AbstractAdminPage } from '../AbstractAdmin.page';
import { PersonManagementViewPage } from './PersonManagementView.page';

export class PersonImportViewPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<PersonImportViewPage> {
    await this.page.getByTestId('person-import-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('person-import-headline')).toHaveText('Benutzer importieren');
    return this;
  }

  public async selectSchule(schule: string): Promise<void> {
    const schuleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('person-import-schule-select'));
    await schuleAutocomplete.searchByTitle(schule, false);
  }

  public async selectRolle(rolle: string): Promise<void> {
    const rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('rolle-select'));
    await rolleAutocomplete.searchByTitle(rolle, true);
  }

  public async uploadFile(filePath: string): Promise<void> {
    await this.page.getByTestId('file-input').locator('input').setInputFiles(filePath);
    return this.page.getByTestId('person-import-form-submit-button').click();
  }

  public async executeImport(): Promise<void> {
    await this.page.getByTestId('open-confirmation-dialog-button').click();
    return this.page.getByTestId('execute-import-button').click();
  }

  public async downloadFile(): Promise<Download> {
    await this.page.getByTestId('download-all-data-button').click();
    return this.page.waitForEvent('download');
  }

  public async closeCard(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('close-layout-card-button').click();
    return new PersonManagementViewPage(this.page);
  }

  /* assertions */
  public async uploadCompletedSuccessfully(expectedCount: number): Promise<void> {
    await expect(this.page.getByTestId('person-upload-success-text')).toHaveText(
      `Die Datei wurde erfolgreich hochgeladen. ${expectedCount} Datensätze stehen zum Import bereit.`
    );
  }

  public async importCompletedSuccessfully(): Promise<void> {
    await expect(this.page.getByTestId('person-import-success-text')).toHaveText(
      'Die Daten wurden erfolgreich importiert. Die importierten Daten stehen zum Download bereit.'
    );
  }

  public verifyFileName(download: Download, fileName: string = 'Benutzerdaten.txt'): void {
    expect(download.suggestedFilename()).toBe(fileName);
  }
}
