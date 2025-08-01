import { Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from './AbstractAdminPage.page';

/**
 * Base class for all management views in the Schulportal.
 */
export abstract class AbstractManagementViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {
    super(page);

    this.page = page;
  }

  /* actions */
  abstract waitForPageLoad(): Promise<void>;
  
  public async searchByText(nameOrKopers: string): Promise<void> {
    const searchFilterInput: Locator = this.page.getByTestId('search-filter-input').locator('input');

    await searchFilterInput.fill(nameOrKopers);
    return this.page.getByTestId('apply-search-filter-button').click();
  }

  /* assertions */
}
