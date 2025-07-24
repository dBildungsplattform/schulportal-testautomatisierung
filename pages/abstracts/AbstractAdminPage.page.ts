import { Page } from '@playwright/test';
import { HeaderPage } from '../components/Header.page';
import { MenuPage } from '../components/MenuBar.page';

/**
 * Base class for all pages in the Schulportal after login.
 */
export abstract class AbstractAdminPage {
  /* add global locators here */
  readonly menu: MenuPage;
  readonly header: HeaderPage;

  constructor(protected readonly page: Page) {
    this.menu = new MenuPage(page);
    this.header = new HeaderPage(page);
    this.page = page;
  }

  /* actions */
  abstract waitForPageLoad(): Promise<void>;

  /* assertions */
}
