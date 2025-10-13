import { Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { Autocomplete } from '../../../../elements/Autocomplete';


export class LandesbedienstetenHinzufuegenPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

   public async waitForPageLoad(): Promise<void> {
    await this.personalInfoHeadline.waitFor({ state: 'visible' });
  }

  // Card & Headline
  public card: Locator = this.page.getByTestId('person-creation-card');
  public headline: Locator = this.card.getByTestId('layout-card-headline');

  // Schließen-Button (Desktop & Mobile)
  public closeButtonDesktop: Locator = this.card.getByTestId('close-layout-card-button');
  public closeButtonMobile: Locator = this.card.locator('.v-btn--icon');

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
  public vornameTextInputfield: Locator = this.form.getByTestId('vorname-input').locator('input');
  public nachnameTextInputfield: Locator = this.form.getByTestId('familienname-input').locator('input');
  public kopersnrTextInputfield: Locator = this.form.getByTestId('kopersnr-input').locator('input');
  public befristungDateInputfield: Locator = this.form.getByTestId('befristung-input').locator('input');
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

  // Headline-Abschnitte
  public personalInfoHeadline: Locator = this.form.locator('h3', { hasText: '1. Persönliche Informationen' });
  public organisationHeadline: Locator = this.form.locator('h3', { hasText: '2. Organisationsebene zuordnen' });
  public rolleHeadline: Locator = this.form.locator('h3', { hasText: '3. Rolle zuordnen' });
  public befristungHeadline: Locator = this.form.locator('h3', { hasText: '4. Befristung zuordnen' });

  // // Organisation wählen
  // public organisationOption = (organisationName: string): Locator =>
  //   this.page.getByRole('option', { name: organisationName });
}