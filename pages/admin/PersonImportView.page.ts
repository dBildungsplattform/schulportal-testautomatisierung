import { type Locator, Page } from '@playwright/test';

export class PersonImportViewPage {
  readonly page: Page;
  readonly body: Locator;
  readonly headlineBenutzerImport: Locator;
  
  constructor(page) {
    // Benutzerimport
    this.page = page;  
    this.body = page.locator('body');
    this.headlineBenutzerImport = page.getByTestId('layout-card-headline');
  }
}