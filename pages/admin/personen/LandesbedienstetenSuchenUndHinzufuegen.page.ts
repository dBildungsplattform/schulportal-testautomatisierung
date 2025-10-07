import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* Locators */
  // Radio Buttons
  private kopersRadio : Locator = this.page.getByLabel('per KoPers.-Nr.');
  private emailRadio : Locator = this.page.getByLabel('per E-Mail');
  private usernameRadio : Locator = this.page.getByLabel('per Benutzername');
  private nameRadio : Locator = this.page.getByLabel('per Vorname und Nachname');

  // Input Eingabefelder nur sichtbar, wenn das jeweilige Radio ausgewählt ist
  private kopersInputField : Locator = this.page.locator('#kopers-input');
  private emailInputField : Locator = this.page.locator('#email-input');
  private usernameInputField : Locator = this.page.locator('#username-input');
  private vornameInputField : Locator = this.page.locator('#vorname-input');
  private nachnameInputField : Locator = this.page.locator('#nachname-input');

  // Inputfelder
  public nachnameInput : Locator = this.page.getByTestId('nachname-input');
  public vornameInput : Locator = this.page.getByTestId('vorname-input')
  // Buttons
  private resetButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  private searchButton : Locator = this.page.getByTestId('person-search-form-submit-button');
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
  // Prüfung: Formular wird vollständig angezeigt
  public async checkForPageCompleteness(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    // 2. Das Dialogfenster enthält:
    //  den Titel Landesbediensteten suchen,
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    //    den Link Schließen mit einem X Icon,
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    //    Den Hinweistext: Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    //  Es gibt 4 Möglichkeiten zu suchen:
    //    per KoPers.-Nr. (Radio Button, vorausgewählt) mit Eingabefeld,
    await expect(this.kopersRadio).toBeChecked();
    await expect(this.kopersInputField).toBeVisible();
    //    per E-Mail-Adresse (Radio Button)
    await expect(this.emailRadio).toBeVisible();
    await expect(this.emailInputField).toBeHidden();
    //    per Benutzernamen (Radio Button)
    await expect(this.usernameRadio).toBeVisible();
    await expect(this.usernameInputField).toBeHidden();
    //    per Vorname und Nachname (Radio Button)
    await expect(this.nameRadio).toBeVisible();
    await expect(this.vornameInputField).toBeHidden();
    await expect(this.nachnameInputField).toBeHidden();
    // die Buttons Zurücksetzen im Status aktiv und Landesbediensteten suchen im Status disabled
    await expect(this.resetButton).toBeEnabled();
    await expect(this.searchButton).toBeDisabled();
  }

  // Formular ausfüllen
  /**
   * Füllt das KoPers.-Nr.-Feld aus, wählt ggf. den Radiobutton aus.
   */
  public async fillKopersNr(kopersNr: string): Promise<void> {
    if (!(await this.kopersRadio.isChecked())) {
      await this.kopersRadio.check();
    }
    await this.kopersInputField.fill(kopersNr);
  }

  /**
   * Füllt das E-Mail-Feld aus, wählt ggf. den Radiobutton aus.
   */
  public async fillEmail(email: string): Promise<void> {
    if (!(await this.emailRadio.isChecked())) {
      await this.emailRadio.check();
    }
    await this.emailInputField.fill(email);
  }

  /**
   * Füllt das Benutzername-Feld aus, wählt ggf. den Radiobutton aus.
   */
  public async fillBenutzername(benutzername: string): Promise<void> {
    if (!(await this.usernameRadio.isChecked())) {
      await this.usernameRadio.check();
    }
    await this.usernameInputField.fill(benutzername);
  }

  /**
   * Füllt die Felder Vorname und Nachname aus, wählt ggf. den Radiobutton aus.
   */
  public async fillVornameNachname( vorname: string, nachname: string): Promise<void> {
    if (!(await this.nameRadio.isChecked())) {
      await this.nameRadio.check();
    }
    await this.nachnameInputField.fill(nachname);
    await this.vornameInputField.fill(vorname);
  }

    /**
   * Klickt auf den Zurücksetzen-Button.
   */
  public async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  /**
   * Klickt auf den Suchen-Button.
   */
  public async clickSearch(): Promise<void> {
    await this.searchButton.click();
  }
}