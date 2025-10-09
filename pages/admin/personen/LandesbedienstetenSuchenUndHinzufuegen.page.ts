import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* Locators */
  // Radio Buttons
  public kopersRadioButton : Locator = this.page.getByLabel('per KoPers.-Nr.');
  public emailRadioButton : Locator = this.page.getByLabel('per E-Mail');
  public usernameRadioButton : Locator = this.page.getByLabel('per Benutzername');
  public nameRadioButton : Locator = this.page.getByLabel('per Vorname und Nachname');

  // Input Eingabefelder nur sichtbar, wenn das jeweilige Radio ausgewählt ist
  public kopersInputField : Locator = this.page.locator('#kopers-input');
  public emailInputField : Locator = this.page.locator('#email-input');
  public usernameInputField : Locator = this.page.locator('#username-input');
  public vornameInputField : Locator = this.page.locator('#vorname-input');
  public nachnameInputField : Locator = this.page.locator('#nachname-input');

  // Inputfelder
  public nachnameInput : Locator = this.page.getByTestId('nachname-input');
  public vornameInput : Locator = this.page.getByTestId('vorname-input')
  // Buttons
  public buttonZuruecksetzen : Locator = this.page.getByTestId('person-search-form-discard-button');
  public buttonLandesbedienstetenSuchen : Locator = this.page.getByTestId('person-search-form-submit-button');
  // Fehlermeldung bei nicht gefundenen Landesbediensteten
  public errorNachname : Locator = this.page.locator('#nachname-input-messages .v-messages__message');
  
  // Suchergebnis Cards
  public suchergebnisCardHeadline: Locator = this.page.getByRole('heading', { name: 'Suchergebnis' });
  // Persönliche Daten
  public personalDataCard: Locator = this.page.getByTestId('personal-data-card').nth(1);
  public personalDataHeadline: Locator = this.personalDataCard.getByRole('heading', { name: 'Persönliche Daten' });
  public pCardFullname: Locator = this.personalDataCard.getByTestId('fullname-value');
  public pCardUsername: Locator = this.personalDataCard.getByTestId('username-value');
  public pCardKopersnummer: Locator = this.personalDataCard.getByTestId('kopersnummer-value');
  public pCardEmail: Locator = this.personalDataCard.getByTestId('person-email-value');
  // Schulzuordnung
  public zuordnungCard: Locator = this.page.getByTestId('zuordnung-card-1');
  public zuordnungHeadline: Locator = this.zuordnungCard.getByTestId('zuordnung-card-1-headline');
  public zCardOrganisation: Locator = this.zuordnungCard.getByTestId('organisation-value-1');
  public zCardRolle: Locator = this.zuordnungCard.getByTestId('rolle-value-1');
  public zCardDienststellennummer: Locator = this.zuordnungCard.getByTestId('dienststellennummer-value-1');
  // Buttons
  public buttonZurueckZurSuche: Locator = this.page.getByTestId('reset-search-button');
  public buttonLandesbedienstetenHinzufuegen: Locator = this.page.getByTestId('add-state-employee-button');


  public async waitForPageLoad(): Promise<void> {
    await this.kopersInputField.waitFor({ state: 'visible' });
  }

  /* actions */
  public async checkForPageCompleteness(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    //  Es gibt 4 Möglichkeiten zu suchen:
    await expect(this.kopersRadioButton).toBeChecked();
    await expect(this.kopersInputField).toBeVisible();
    await expect(this.emailRadioButton).toBeVisible();
    await expect(this.emailInputField).toBeHidden();
    await expect(this.usernameRadioButton).toBeVisible();
    await expect(this.usernameInputField).toBeHidden();
    await expect(this.nameRadioButton).toBeVisible();
    await expect(this.vornameInputField).toBeHidden();
    await expect(this.nachnameInputField).toBeHidden();
    await expect(this.buttonZuruecksetzen).toBeEnabled();
    await expect(this.buttonLandesbedienstetenSuchen).toBeDisabled();
  }

  // Formular ausfüllen
  public async fillKopersNr(kopersNr: string): Promise<void> {
    if (!(await this.kopersRadioButton.isChecked())) {
      await this.kopersRadioButton.check();
    }
    await this.kopersInputField.fill(kopersNr);
  }

  public async fillEmail(email: string): Promise<void> {
    if (!(await this.emailRadioButton.isChecked())) {
      await this.emailRadioButton.check();
    }
    await this.emailInputField.fill(email);
  }

  public async fillBenutzername(benutzername: string): Promise<void> {
    if (!(await this.usernameRadioButton.isChecked())) {
      await this.usernameRadioButton.check();
    }
    await this.usernameInputField.fill(benutzername);
  }

  public async fillVornameNachname( vorname: string, nachname: string): Promise<void> {
    if (!(await this.nameRadioButton.isChecked())) {
      await this.nameRadioButton.check();
    }
    await this.nachnameInputField.fill(nachname);
    await this.vornameInputField.fill(vorname);
  }

  public async clickReset(): Promise<void> {
    await this.buttonZuruecksetzen.click();
  }

  public async clickSearch(): Promise<void> {
    await this.buttonLandesbedienstetenSuchen.click();
  }
}