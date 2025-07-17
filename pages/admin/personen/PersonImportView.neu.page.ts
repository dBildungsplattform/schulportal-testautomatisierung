import { Download, expect, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { AbstractAdminPage } from '../../abstracts/AbstractAdminPage.page';
import { PersonManagementViewPage } from './PersonManagementView.page';

export class PersonImportViewPage extends AbstractAdminPage {
  constructor(page: Page) {
    super(page);
  }

  /* actions */
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('person-import-card').waitFor({ state: 'visible' });
  }

  async selectSchule(schule: string): Promise<void> {
    const schuleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    return schuleAutocomplete.searchByTitle(schule, true);
  }

  async selectRolle(rolle: string): Promise<void> {
    const rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));
    return rolleAutocomplete.searchByTitle(rolle, true);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.page.getByTestId('file-input').locator('input').setInputFiles(filePath);
    return this.page.getByTestId('person-import-form-submit-button').click();
  }

  async executeImport(): Promise<void> {
    return this.page.getByTestId('execute-import-button').click();
  }

  async downloadFile(): Promise<Download> {
    await this.page.getByTestId('download-all-data-button').click();
    return this.page.waitForEvent('download');
  }

  async closeCard(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('close-layout-card-button').click();
    return new PersonManagementViewPage(this.page);
  }

  /* assertions */

  async uploadCompletedSuccessfully(expectedCount: number): Promise<void> {
    return expect(this.page.getByTestId('person-upload-success-text')).toHaveText(
      `Die Datei wurde erfolgreich hochgeladen. ${expectedCount} Datensätze stehen zum Import bereit.`
    );
  }

  async importCompletedSuccessfully(): Promise<void> {
    return expect(this.page.getByTestId('person-import-success-text')).toHaveText(
      'Die Daten wurden erfolgreich importiert. Die importierten Daten stehen zum Download bereit.'
    );
  }

  async verifyFileName(download: Download, fileName: string = 'Benutzerdaten.txt'): Promise<void> {
    return expect(download.suggestedFilename()).toBe(fileName);
  }
}
