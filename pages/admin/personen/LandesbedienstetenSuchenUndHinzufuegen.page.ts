import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* Locators */
  private kopersRadioButton : Locator = this.page.getByLabel('per KoPers.-Nr.');
  private emailRadioButton : Locator = this.page.getByLabel('per E-Mail');
  private usernameRadioButton : Locator = this.page.getByLabel('per Benutzername');
  private nameRadioButton : Locator = this.page.getByLabel('per Vorname und Nachname');

  private kopersTextInput : Locator = this.page.locator('#kopers-input');
  private emailTextInput : Locator = this.page.locator('#email-input');
  private usernameTextInput : Locator = this.page.locator('#username-input');
  private vornameTextInput : Locator = this.page.locator('#vorname-input');
  private nachnameTextInput : Locator = this.page.locator('#nachname-input');
  
  private resetButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  private searchButton : Locator = this.page.getByTestId('person-search-form-submit-button');
  
  public async waitForPageLoad(): Promise<void> {
    await this.kopersTextInput.waitFor({ state: 'visible' });
  }

  /* actions */

  public async checkForPageCompleteness(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    //  Es gibt 4 Möglichkeiten zu suchen:
    await expect(this.kopersRadioButton).toBeChecked();
    await expect(this.kopersTextInput).toBeVisible();
    await expect(this.emailRadioButton).toBeVisible();
    await expect(this.emailTextInput).toBeHidden();
    await expect(this.usernameRadioButton).toBeVisible();
    await expect(this.usernameTextInput).toBeHidden();
    await expect(this.nameRadioButton).toBeVisible();
    await expect(this.vornameTextInput).toBeHidden();
    await expect(this.nachnameTextInput).toBeHidden();
    // die Buttons Zurücksetzen im Status aktiv und Landesbediensteten suchen im Status disabled
    await expect(this.resetButton).toBeEnabled();
    await expect(this.searchButton).toBeDisabled();
  }
}