import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* Locators */
  private kopersRadio : Locator = this.page.getByLabel('per KoPers.-Nr.');
  private emailRadio : Locator = this.page.getByLabel('per E-Mail');
  private usernameRadio : Locator = this.page.getByLabel('per Benutzername');
  private nameRadio : Locator = this.page.getByLabel('per Vorname und Nachname');

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

  public async checkForPageCompleteness(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    //  Es gibt 4 Möglichkeiten zu suchen:
    await expect(this.kopersRadio).toBeChecked();
    await expect(this.kopersInput).toBeVisible();
    await expect(this.emailRadio).toBeVisible();
    await expect(this.emailInput).toBeHidden();
    await expect(this.usernameRadio).toBeVisible();
    await expect(this.usernameInput).toBeHidden();
    await expect(this.nameRadio).toBeVisible();
    await expect(this.vornameInput).toBeHidden();
    await expect(this.nachnameInput).toBeHidden();
    // die Buttons Zurücksetzen im Status aktiv und Landesbediensteten suchen im Status disabled
    await expect(this.resetButton).toBeEnabled();
    await expect(this.searchButton).toBeDisabled();
  }
}