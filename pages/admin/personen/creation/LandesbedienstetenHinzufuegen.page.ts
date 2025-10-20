import { expect, Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { Autocomplete } from '../../../../elements/Autocomplete';


export class LandesbedienstetenHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

   public async waitForPageLoad(): Promise<void> {
    await this.personalInfoHeadline.waitFor({ state: 'visible' });
  }

  // Card Elemente
  public card: Locator = this.page.getByTestId('person-creation-card');
  public headline: Locator = this.card.getByTestId('layout-card-headline');
  public closeButtonX: Locator = this.card.getByTestId('close-layout-card-button');
  public erfolgsText: Locator = this.card.getByTestId('landesbediensteter-success-text');

  public zurGesamtuebersichtButton: Locator = this.card.getByTestId('to-details-button');
  public zurueckZurErgebnislisteButton: Locator = this.card.getByTestId('back-to-list-button');
  public weiterenLandesbedienstetenSuchenButton: Locator = this.card.getByTestId('search-another-landesbediensteter-button');

  // Formular
  public form: Locator = this.card.getByTestId('person-creation-form');
  public pflichtfelderHinweisText: Locator = this.page.getByTestId('person-creation-form').locator('label.subtitle-2');

  public vornameInput: Locator = this.form.getByTestId('vorname-input');
  public nachnameInput: Locator = this.form.getByTestId('familienname-input');
  public kopersnrInput: Locator = this.form.getByTestId('kopersnr-input');
  public hasNoKopersnrCheckbox: Locator = this.form.getByTestId('has-no-kopersnr-checkbox');
  public befristungInput: Locator = this.form.getByTestId('befristung-input');

  public bisSchuljahresendeRadio: Locator = this.form.locator('input[type="radio"][aria-label*="Schuljahresende"]');
  public unbefristetRadio: Locator = this.form.getByTestId('unbefristet-radio-button');
    // Inputfelder für die Dateneingabe
  public vornameTextInputfield: Locator = this.vornameInput.locator('input');
  public nachnameTextInputfield: Locator = this.nachnameInput.locator('input');
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

  // Popups & Fehlermeldungen
  // Landesbediensteten hinzufügen Nachfrage-Popup
  public nachfragetextImBestaetigungsPopup: Locator = this.page.getByTestId('add-person-confirmation-text');
  public abbrechenButtonImBestaetigungsPopup: Locator = this.page.getByTestId('cancel-add-person-confirmation-button');
  public landesbedienstetenHinzufuegenButtonImBestaetigungsPopup: Locator = this.page.getByTestId('confirm-add-person-button');

  public async checkForBestaetigungspopupCompleteness(): Promise<void> {
    await expect(this.headline).toBeVisible();
    await expect(this.headline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.nachfragetextImBestaetigungsPopup).toBeVisible(); //Text ist individuell, wird im Test geprüft
    await expect(this.abbrechenButtonImBestaetigungsPopup).toBeVisible();
    await expect(this.abbrechenButtonImBestaetigungsPopup).toHaveText('Abbrechen');
    await expect(this.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup).toBeVisible();
    await expect(this.landesbedienstetenHinzufuegenButtonImBestaetigungsPopup).toHaveText('Landesbediensteten hinzufügen');
  }

  // Card nach dem Hinzufügen eines Landesbediensteten
  
  
}