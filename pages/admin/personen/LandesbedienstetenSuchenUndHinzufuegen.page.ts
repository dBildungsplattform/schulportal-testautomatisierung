import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);

  }

  /* Locators */
  private kopersRadio : Locator = this.page.getByTestId('kopers-radio');
  private emailRadio : Locator = this.page.getByTestId('email-radio');
  private usernameRadio : Locator = this.page.getByTestId('username-radio');
  private nameRadio : Locator = this.page.getByTestId('name-radio');

  // Inputfelder nur sichtbar, wenn das jeweilige Radio ausgewählt ist
  private kopersInput : Locator = this.page.locator('#kopers-input');
  private emailInput : Locator = this.page.locator('#email-input');
  private usernameInput : Locator = this.page.locator('#username-input');
  private vornameInput : Locator = this.page.locator('#vorname-input');
  private nachnameInput : Locator = this.page.locator('#nachname-input');
  
  private resetButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  private searchButton : Locator = this.page.getByTestId('person-search-form-submit-button');
  
  public async waitForPageLoad(): Promise<void> {
    await this.kopersInput.waitFor({ state: 'visible' });
  }

  /* actions */

}