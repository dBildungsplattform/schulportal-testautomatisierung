import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { AbstractAdminPage } from "../../abstracts/AbstractAdminPage.page";
import { Autocomplete } from '../../../elements/Autocomplete';

export class LandesbedienstetenSuchenUndHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* Locators */
  /*Landesbediensteten suchen*/
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
  // Inputfelder zur Dateneingabe
  public nachnameInput : Locator = this.page.getByTestId('nachname-input');
  public vornameInput : Locator = this.page.getByTestId('vorname-input')
  // Buttons
  public buttonZuruecksetzen : Locator = this.page.getByTestId('person-search-form-discard-button');
  public buttonLandesbedienstetenSuchen : Locator = this.page.getByTestId('person-search-form-submit-button');
  /* Fehlermeldung bei nicht gefundenen Landesbediensteten */
  public errorNachname : Locator = this.page.locator('#nachname-input-messages .v-messages__message');
  
  /* Suchergebnis Cards */
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

  /*Landesbediensteten Hinzufügen*/
  // Card Elemente
  public card: Locator = this.page.getByTestId('person-creation-card');
  public headline: Locator = this.card.getByTestId('layout-card-headline');
  public closeButtonX: Locator = this.card.getByTestId('close-layout-card-button');
  public erfolgsText: Locator = this.card.getByTestId('landesbediensteter-success-text');
  // Buttons nach erfolgreichem Hinzufügen auf Bestätigungscard
  public zurGesamtuebersichtButton: Locator = this.card.getByTestId('to-details-button');
  public zurueckZurErgebnislisteButton: Locator = this.card.getByTestId('back-to-list-button');
  public weiterenLandesbedienstetenSuchenButton: Locator = this.card.getByTestId('search-another-landesbediensteter-button');
  // Formular
  public form: Locator = this.card.getByTestId('person-creation-form');
  public pflichtfelderHinweisText: Locator = this.page.getByTestId('person-creation-form').locator('label.subtitle-2');
  public formVornameInput: Locator = this.form.getByTestId('vorname-input');
  public formNachnameInput: Locator = this.form.getByTestId('familienname-input');
  public kopersnrInput: Locator = this.form.getByTestId('kopersnr-input');
  public hasNoKopersnrCheckbox: Locator = this.form.getByTestId('has-no-kopersnr-checkbox');
  public befristungInput: Locator = this.form.getByTestId('befristung-input');
  public bisSchuljahresendeRadio: Locator = this.form.locator('input[type="radio"][aria-label*="Schuljahresende"]');
  public unbefristetRadio: Locator = this.form.getByTestId('unbefristet-radio-button');
  // Inputfelder für die Dateneingabe
  public vornameTextInputfield: Locator = this.formVornameInput.locator('input');
  public nachnameTextInputfield: Locator = this.formNachnameInput.locator('input');
  public kopersnrTextInputfield: Locator = this.kopersnrInput.locator('input');
  public befristungDateInputfield: Locator = this.befristungInput.locator('input');
  public organisationSelect: Locator = this.form.getByTestId('personenkontext-create-organisation-select');
  public organisationOeffnenButton: Locator = this.page.locator('[data-testid="personenkontext-create-organisation-select"] i[aria-label="Öffnen"]');
  public organisationDropdown: Locator = this.organisationSelect.locator('.v-list-item, [role="option"]');
  public rollenSelect: Locator = this.form.getByTestId('rollen-select');
  public rolleOeffnenButton: Locator = this.page.locator('[data-testid="rollen-select"] i[aria-label="Öffnen"]');
  public organisationAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('personenkontext-create-organisation-select'));
  public rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('rollen-select'));
  // Buttons
  public abbrechenButton: Locator = this.form.getByTestId('person-creation-form-discard-button');
  public landesbedienstetenHinzufuegenButton: Locator = this.form.getByTestId('person-creation-form-submit-button');
  // Headline-Abschnitte im Formular
  public personalInfoHeadline: Locator = this.form.locator('h3', { hasText: '1. Persönliche Informationen' });
  public organisationHeadline: Locator = this.form.locator('h3', { hasText: '2. Organisationsebene zuordnen' });
  public rolleHeadline: Locator = this.form.locator('h3', { hasText: '3. Rolle zuordnen' });
  public befristungHeadline: Locator = this.form.locator('h3', { hasText: '4. Befristung zuordnen' });

  /* Landesbediensteten hinzufügen Nachfrage-Popup */
  public nachfragetextImBestaetigungsPopup: Locator = this.page.getByTestId('add-person-confirmation-text');
  public abbrechenButtonImBestaetigungsPopup: Locator = this.page.getByTestId('cancel-add-person-confirmation-button');
  public landesbedienstetenHinzufuegenButtonImBestaetigungsPopup: Locator = this.page.getByTestId('confirm-add-person-button');


  public async waitForPageLoad(): Promise<void> {
    await this.kopersInputField.waitFor({ state: 'visible' });
  }

  /* actions */
  public async checkForPageCompleteness(): Promise<boolean> {
    try {
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
      return true;
    } catch {
      return false;
    }
  }
  
  public async checkForBestaetigungspopupCompleteness(): Promise<void> {
    await expect(this.headline).toBeVisible();
    await expect(this.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.nachfragetextImBestaetigungsPopup).toBeVisible(); //Text ist individuell, wird im Test geprüft
    await expect(this.abbrechenButtonImBestaetigungsPopup).toBeVisible();
    await expect(this.abbrechenButtonImBestaetigungsPopup).toHaveText('Abbrechen');
    await expect(this.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup).toBeVisible();
    await expect(this.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup).toHaveText('Landesbediensteten hinzufügen');
  }

  // Landesbediensteten hinzufügen Suche Formular ausfüllen
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
      await this.usernameRadioButton.click();
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

  // Landesbediensteten suchen und Landesbediensteten hinzufügen klicken
  public async landesbedienstetenSuchen(benutzername: string): Promise<void> {
    await this.waitForPageLoad();
    await this.fillBenutzername(benutzername);
    await this.clickSearch();
    await this.buttonLandesbedienstetenHinzufuegen.click();
  }
}