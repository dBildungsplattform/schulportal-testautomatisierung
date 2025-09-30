import { expect } from '@playwright/test';
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

  public async checkForPageCompleteness(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    // 2. Das Dialogfenster enthält:
    //  den Titel Landesbediensteten suchen,
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    //    den Link Schließen mit einem X Icon,
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    //    Den Hinweistext: Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.
    await expect(this.page.getByTestId('hint-text')).toHaveText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.');
    //  Es gibt 4 Möglichkeiten zu suchen:
    //    per KoPers.-Nr. (Radio Button, vorausgewählt) mit Eingabefeld,
    await expect(this.kopersRadio).toBeChecked();
    await expect(this.kopersInput).toBeVisible();
    //    per E-Mail-Adresse (Radio Button)
    await expect(this.emailRadio).toBeVisible();
    await expect(this.emailInput).toBeHidden();
    //    per Benutzernamen (Radio Button)
    await expect(this.usernameRadio).toBeVisible();
    await expect(this.usernameInput).toBeHidden();
    //    per Vorname und Nachname (Radio Button)
    await expect(this.nameRadio).toBeVisible();
    await expect(this.vornameInput).toBeHidden();
    await expect(this.nachnameInput).toBeHidden();
    // die Buttons Zurücksetzen im Status aktiv und Landesbediensteten suchen im Status disabled
    await expect(this.resetButton).toBeEnabled();
    await expect(this.searchButton).toBeDisabled();
  }
}