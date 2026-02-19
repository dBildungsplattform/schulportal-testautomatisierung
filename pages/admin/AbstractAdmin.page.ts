import { Page } from "@playwright/test";
import { HeaderPage } from "../components/Header.neu.page";
import { MenuBarPage } from "../components/MenuBar.neu.page";

export abstract class AbstractAdminPage {
  protected header: HeaderPage;
  protected menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.header = new HeaderPage(page);
    this.menu = new MenuBarPage(page);
  }

  abstract waitForPageLoad(): Promise<AbstractAdminPage>;

  getHeader(): HeaderPage {
    return this.header;
  }
  
  getMenu(): MenuBarPage {
    return this.menu;
  }
}