import { Page } from '@playwright/test';
import { HeaderPage } from '../components/Header.neu.page';
import { MenuBarPage } from '../components/MenuBar.neu.page';

/**
 * Base class for all pages in the Schulportal after login.
 */
export abstract class AbstractAdminPage {
  /* add global locators here */
  readonly menu: MenuBarPage;
  readonly header: HeaderPage;

  constructor(protected readonly page: Page) {
    this.menu = new MenuBarPage(page);
    this.header = new HeaderPage(page);
    this.page = page;
  }

  /* actions */
  abstract waitForPageLoad(expectedHeadline?: string): Promise<void>;

  /* assertions */
}
