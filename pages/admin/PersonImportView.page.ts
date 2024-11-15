import { type Locator, Page } from '@playwright/test';

export class PersonImportViewPage {
  readonly page: Page;
  readonly body: Locator;
  readonly headlineBenutzerImport: Locator;
  readonly schuleSelectInput: Locator;
  readonly rolleSelectInput: Locator;
  readonly fileInput: Locator;
  readonly discardFileUploadButton: Locator;
  readonly submitFileUploadButton: Locator;
  
  constructor(page) {
    // Benutzerimport
    this.page = page;  
    this.body = page.locator('body');
    this.headlineBenutzerImport = page.getByTestId('layout-card-headline');
    this.schuleSelectInput = page.getByTestId('schule-select').locator('input');
    this.rolleSelectInput = page.getByTestId('rolle-select').locator('input');
    this.fileInput = page.getByTestId('file-input').locator('input');
    this.discardFileUploadButton = page.getByTestId('person-import-form-discard-button');
    this.submitFileUploadButton = page.getByTestId('person-import-form-submit-button');
  }
}