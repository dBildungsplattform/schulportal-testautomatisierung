import { Page } from '@playwright/test';

/**
 * Base class for all pages in the Schulportal after login.
 */
export abstract class AbstractAdminPage {
  /* add global locators here */
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  abstract waitForPageLoad(expectedHeadline?: string): Promise<void>;

  /* assertions */
}