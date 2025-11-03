import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { Autocomplete } from '../../../elements/Autocomplete';

export class LandesbedienstetenSuchenUndHinzufuegenPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  readonly adminHeadline: Locator = this.page.getByTestId('admin-headline');
  
  /* Landesbediensteten Suchen - Suche und Suchergebnis */
  readonly kopersRadioButton : Locator = this.page.getByTestId('kopers-radio-button');
  readonly emailRadioButton : Locator = this.page.getByTestId('email-radio-button');
  readonly usernameRadioButton : Locator = this.page.getByTestId('username-radio-button');
  readonly nameRadioButton : Locator = this.page.getByTestId('name-radio-button');
  readonly kopersInput : Locator = this.page.getByTestId('kopers-input').locator('input');
  readonly emailInput : Locator = this.page.getByTestId('email-input').locator('input');
  readonly usernameInput : Locator = this.page.getByTestId('username-input').locator('input');
  readonly vornameInput : Locator = this.page.getByTestId('vorname-input').locator('input');
  readonly nachnameInput : Locator = this.page.getByTestId('nachname-input').locator('input');
  /* the reset search button's id is not properly named due to automated name generation in forms,
     and a different usage of that button in the search form */
  readonly resetSearchButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  readonly submitSearchButton : Locator = this.page.getByTestId('person-search-form-submit-button');  
  readonly personalDataCardFullname: Locator = this.page.getByTestId('fullname-value');
  readonly zurueckZurSucheButton: Locator = this.page.getByTestId('back-to-search-button');
  readonly landesbedienstetenHinzufuegenButton: Locator = this.page.getByTestId('add-state-employee-button');

  /* Landesbediensteten Hinzufügen - Formular zum Hinzufügen */
  readonly landesbedienstetenHinzufuegenHeadline: Locator = this.page.getByTestId('add-state-employee-headline');
  readonly closeButton: Locator = this.page.getByTestId('close-layout-card-button');
  readonly goToDetailsButton: Locator = this.page.getByTestId('go-to-details-button');
  readonly backToListButton: Locator = this.page.getByTestId('back-to-list-button');

  readonly personCreationForm: Locator = this.page.getByTestId('person-creation-form');
  readonly mandatoryFieldsNotice: Locator = this.personCreationForm.getByTestId('mandatory-fields-notice');
  readonly personalInfoHeadline: Locator = this.personCreationForm.locator('h3', { hasText: '1. Persönliche Informationen' });
  readonly formVornameInput: Locator = this.personCreationForm.getByTestId('vorname-input');
  readonly formNachnameInput: Locator = this.personCreationForm.getByTestId('familienname-input');
  readonly hasNoKopersnrCheckbox: Locator = this.personCreationForm.getByTestId('has-no-kopersnr-checkbox');
  readonly formKopersInput: Locator = this.personCreationForm.getByTestId('kopersnr-input');
  readonly organisationHeadline: Locator = this.personCreationForm.locator('h3', { hasText: '2. Organisationsebene zuordnen' });
  readonly organisationAutocomplete: Autocomplete = new Autocomplete(this.page, this.personCreationForm.getByTestId('personenkontext-create-organisation-select'));
  readonly rolleHeadline: Locator = this.personCreationForm.locator('h3', { hasText: '3. Rolle zuordnen' });
  readonly rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.personCreationForm.getByTestId('rollen-select'));
  readonly befristungHeadline: Locator = this.personCreationForm.locator('h3', { hasText: '4. Befristung zuordnen' });
  readonly befristungInput: Locator = this.personCreationForm.getByTestId('befristung-input');
  readonly schuljahresendeRadioButton: Locator = this.personCreationForm.getByTestId('schuljahresende-radio-button');
  readonly unbefristetRadioButton: Locator = this.personCreationForm.getByTestId('unbefristet-radio-button');

  readonly discardFormButton: Locator = this.personCreationForm.getByTestId('person-creation-form-discard-button');
  readonly submitLandesbedienstetenHinzufuegenButton: Locator = this.personCreationForm.getByTestId('person-creation-form-submit-button');

  /* Confirmation dialog */
  readonly dialogHeadline: Locator = this.page.getByTestId('add-person-confirmation-dialog-headline');
  readonly confirmationDialogText: Locator = this.page.getByTestId('add-person-confirmation-text');
  readonly confirmationDialogCancelButton: Locator = this.page.getByTestId('cancel-add-person-confirmation-button');
  readonly confirmationDialogConfirmButton: Locator = this.page.getByTestId('confirm-add-person-button');

  readonly successText: Locator = this.page.getByTestId('state-employee-success-text');

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.kopersInput.waitFor({ state: 'visible' });
  }

  public async fillKopersNr(kopersNr: string): Promise<void> {
    if (!(await this.kopersRadioButton.isChecked())) {
      await this.kopersRadioButton.check();
    }
    await this.kopersInput.fill(kopersNr);
  }

  public async fillEmail(email: string): Promise<void> {
    if (!(await this.emailRadioButton.isChecked())) {
      await this.emailRadioButton.check();
    }
    await this.emailInput.fill(email);
  }

  public async fillBenutzername(benutzername: string): Promise<void> {
    if (!(await this.usernameRadioButton.isChecked())) {
      await this.usernameRadioButton.click();
    }
    await this.usernameInput.fill(benutzername);
  }

  public async fillName(vorname: string, nachname: string): Promise<void> {
    if (!(await this.nameRadioButton.isChecked())) {
      await this.nameRadioButton.check();
    }
    await this.vornameInput.fill(vorname);
    await this.nachnameInput.fill(nachname);
  }

  public async checkMandatoryFieldsForNameSearch(vorname: string, nachname: string): Promise<void> {
    await this.fillName(vorname, nachname);
    await this.clickSearch();
    if (vorname === "") {
      await expect(this.page.getByTestId('vorname-input').locator('.v-messages__message')).toHaveText("Der Vorname ist erforderlich.");
    }
    if (nachname === "") {
      await expect(this.page.getByTestId('nachname-input').locator('.v-messages__message')).toHaveText("Der Nachname ist erforderlich.");
    }
  }

  public async clickReset(): Promise<void> {
    await this.resetSearchButton.click();
  }

  public async clickSearch(): Promise<void> {
    await this.submitSearchButton.click();
  }

  public async searchByName(vorname: string, familienname: string): Promise<void> {
    await this.fillName(vorname, familienname);
    await this.clickSearch();
    await expect(this.personalDataCardFullname).toHaveText(`${vorname} ${familienname}`);
  }

  public async goBackToSearchForm(vorname: string, familienname: string): Promise<void> {
    await this.zurueckZurSucheButton.click();
    await expect(this.personalDataCardFullname).toBeHidden();
    await expect(this.nameRadioButton).toBeChecked();
    await expect(this.vornameInput).toHaveValue(vorname);
    await expect(this.nachnameInput).toHaveValue(familienname);
  }

  public async resetSearchForm(): Promise<void> {
    await this.resetSearchButton.click();
    await expect(this.personalDataCardFullname).toBeHidden();
    await expect(this.nameRadioButton).toBeChecked();
    await expect(this.vornameInput).toBeEmpty();
    await expect(this.nachnameInput).toBeEmpty();
  }

  public async landesbedienstetenSuchen(benutzername: string): Promise<void> {
    await this.waitForPageLoad();
    await this.fillBenutzername(benutzername);
    await this.clickSearch();
    await this.landesbedienstetenHinzufuegenButton.click();
  }

  public async landesbedienstetenHinzufuegenAlsLehrkraft(): Promise<void> {
    await this.submitSearchButton.click();
    await this.landesbedienstetenHinzufuegenButton.click();
    await this.rolleAutocomplete.selectByTitle('LiV');
    await this.submitLandesbedienstetenHinzufuegenButton.click();
    await this.confirmationDialogConfirmButton.click();
  }

  public async cancelConfirmationDialog(): Promise<void> {
    await this.confirmationDialogCancelButton.click();
    await expect(this.dialogHeadline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.submitLandesbedienstetenHinzufuegenButton).toBeEnabled();
  }

  public async confirmLandesbedienstetenHinzufuegen(): Promise<void> {
    await this.submitLandesbedienstetenHinzufuegenButton.click();
    await this.confirmationDialogConfirmButton.click();
  }

  /* assertions */
  public async checkSearchForm(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    await expect(this.kopersRadioButton).toBeChecked();
    await expect(this.kopersInput).toBeVisible();
    await expect(this.emailRadioButton).toBeVisible();
    await expect(this.emailInput).toBeHidden();
    await expect(this.usernameRadioButton).toBeVisible();
    await expect(this.usernameInput).toBeHidden();
    await expect(this.nameRadioButton).toBeVisible();
    await expect(this.vornameInput).toBeHidden();
    await expect(this.nachnameInput).toBeHidden();
    await expect(this.resetSearchButton).toBeEnabled();
    await expect(this.submitSearchButton).toBeDisabled();
  }

  public async checkSearchResultCard(): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline-search-result')).toHaveText('Suchergebnis');
    await expect(this.landesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(this.zurueckZurSucheButton).toBeVisible();
  }

  public async checkPersonalDataCard(
    fullName: string, username: string, kopersnummer: string, email: string
  ): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline-personal-data')).toHaveText('Persönliche Daten');
    await expect(this.personalDataCardFullname).toHaveText(fullName);
    await expect(this.page.getByTestId('username-value')).toHaveText(username);
    await expect(this.page.getByTestId('kopersnummer-value')).toHaveText(kopersnummer);
    await expect(this.page.getByTestId('person-email-value')).toHaveText(email);
  }

  // TODO: rewrite this function to iterate all zuordnungen
  public async checkZuordnungCards(organisation: string, rolle: string, dienststellennummer: string): Promise<void> {
    await expect(this.page.getByTestId('zuordnung-card-1-headline')).toHaveText('Schulzuordnung');
    await expect(this.page.getByTestId('organisation-value-1')).toHaveText(organisation);
    await expect(this.page.getByTestId('rolle-value-1')).toHaveText(rolle);
    await expect(this.page.getByTestId('dienststellennummer-value-1')).toHaveText(dienststellennummer);
  }

  public async checkForBestaetigungspopupCompleteness(): Promise<void> {
    await expect(this.landesbedienstetenHinzufuegenHeadline).toBeVisible();
    await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.confirmationDialogText).toBeVisible();
    await expect(this.confirmationDialogCancelButton).toBeVisible();
    await expect(this.confirmationDialogCancelButton).toHaveText('Abbrechen');
    await expect(this.confirmationDialogConfirmButton).toBeVisible();
    await expect(this.confirmationDialogConfirmButton).toHaveText('Landesbediensteten hinzufügen');
  }

  public async checkCreationForm(vorname: string, nachname: string, kopersnummer: string, organisationText?: string): Promise<void> {
    await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.mandatoryFieldsNotice).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
    await expect(this.closeButton).toBeVisible();
    await expect(this.formVornameInput).toBeVisible();
    await expect(this.formNachnameInput).toBeVisible();
    await expect(this.formKopersInput).toBeVisible();
    await expect(this.hasNoKopersnrCheckbox).toBeVisible();
    await expect(this.organisationAutocomplete.isVisible()).toBeTruthy();
    await expect(this.rolleAutocomplete.isVisible()).toBeTruthy();
    await expect(this.discardFormButton).toBeVisible();
    await expect(this.submitLandesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(this.personalInfoHeadline).toBeVisible();
    await expect(this.organisationHeadline).toBeVisible();
    await expect(this.rolleHeadline).toBeVisible();
    await expect(this.submitLandesbedienstetenHinzufuegenButton).toBeDisabled();
    // Persönliche Daten sind vorausgefüllt
    await expect(this.formVornameInput).toHaveText(vorname);
    await expect(this.formNachnameInput).toHaveText(nachname);
    await expect(this.formKopersInput).toHaveText(kopersnummer);
    // Organisation ist vorausgewählt
    await this.organisationAutocomplete.checkText(organisationText);
  }

  public async checkSelectableOrganisationen(expectedOrganisationen: string[]): Promise<void> {
    await this.organisationAutocomplete.assertAllMenuItems(expectedOrganisationen);
  }

  public async checkSuccessPage(vorname: string, nachname: string, kopersnummer: string, username: string, organisation: string): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
    await expect(this.successText).toHaveText(`${vorname} ${nachname} wurde erfolgreich hinzugefügt.`);
    await expect(this.page.getByTestId('following-data-added-text')).toHaveText('Folgende Daten wurden gespeichert:');
    await expect(this.page.getByTestId('added-state-employee-vorname-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-vorname')).toHaveText(vorname);
    await expect(this.page.getByTestId('added-state-employee-familienname-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-familienname')).toHaveText(nachname);
    await expect(this.page.getByTestId('added-state-employee-personalnummer-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-personalnummer')).toHaveText(kopersnummer);
    await expect(this.page.getByTestId('added-state-employee-username-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-username')).toHaveText(username);
    await expect(this.page.getByTestId('added-state-employee-organisation-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-organisation')).toHaveText(organisation);
    await expect(this.page.getByTestId('added-state-employee-rolle-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-rolle')).toHaveText('LiV');
    await expect(this.page.getByTestId('added-state-employee-befristung-label')).toBeVisible();
    await expect(this.page.getByTestId('added-state-employee-befristung')).toBeVisible();
    await expect(this.page.getByTestId('go-to-details-button')).toHaveText('Zur Gesamtübersicht');
    await expect(this.page.getByTestId('back-to-list-button')).toHaveText('Zurück zur Ergebnisliste');
    await expect(this.page.getByTestId('search-another-state-employee-button')).toHaveText('Weiteren Landesbediensteten suchen');
  }
}