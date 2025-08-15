import { Page } from '@playwright/test';
import { AbstractAdminPage } from './AbstractAdminPage.page';
import { DataTable } from '../components/DataTable.neu.page';

/**
 * Base class for all management views in the Schulportal.
 */
export abstract class AbstractManagementViewPage extends AbstractAdminPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {
    super(page);
  }

  /* actions */
  abstract waitForPageLoad(): Promise<void>;

  // TODO: Implement common actions for management views

  /* assertions */
}
