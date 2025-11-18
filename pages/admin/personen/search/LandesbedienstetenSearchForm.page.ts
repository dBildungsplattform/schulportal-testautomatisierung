import { expect } from '@playwright/test';
import { Locator, Page } from "@playwright/test";
import { Autocomplete } from '../../../../elements/Autocomplete';
import { SearchResultErrorDialog } from '../../../components/SearchResultErrorDialog';

export class LandesbedienstetenSearchFormPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  private readonly adminHeadline: Locator = this.page.getByTestId('admin-headline');
  
  /* Landesbediensteten Suchen  */
  private readonly kopersRadioInput : Locator = this.page.getByTestId('kopers-radio-button').locator('input');
  private readonly emailRadioInput : Locator = this.page.getByTestId('email-radio-button').locator('input');
  private readonly usernameRadioInput : Locator = this.page.getByTestId('username-radio-button').locator('input');
  private readonly nameRadioInput : Locator = this.page.getByTestId('name-radio-button').locator('input');
  private readonly kopersInput : Locator = this.page.getByTestId('kopers-input').locator('input');
  private readonly emailInput : Locator = this.page.getByTestId('email-input').locator('input');
  private readonly usernameInput : Locator = this.page.getByTestId('username-input').locator('input');
  private readonly vornameInput : Locator = this.page.getByTestId('vorname-input').locator('input');
  private readonly nachnameInput : Locator = this.page.getByTestId('nachname-input').locator('input');
  /* the reset search button's id is not properly named due to automated name generation in forms,
     and a different usage of that button in the search form */
  private readonly zuruecksetzenButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  private readonly landesbedienstetenSuchenButton : Locator = this.page.getByTestId('person-search-form-submit-button');

  //------------------------------ Aktueller Stand bis hier ------------------------------
  //und Suchergebnis
  // private readonly personalDataCardFullname: Locator = this.page.getByTestId('fullname-value');
  // // TODO: Schulzuordnung fehlt
  // private readonly zurueckZurSucheButton: Locator = this.page.getByTestId('back-to-search-button');
  // private readonly landesbedienstetenHinzufuegenButton: Locator = this.page.getByTestId('add-state-employee-button');

  // /* Landesbediensteten Hinzufügen */
  // private readonly landesbedienstetenHinzufuegenHeadline: Locator = this.page.getByTestId('add-state-employee-headline');
  // private readonly closeButton: Locator = this.page.getByTestId('close-layout-card-button');
  // Formular
  // private readonly personCreationForm: Locator = this.page.getByTestId('person-creation-form');
  // private readonly mandatoryFieldsNotice: Locator = this.personCreationForm.getByTestId('mandatory-fields-notice');
  // private readonly personalInfoHeadline: Locator = this.personCreationForm.getByTestId('personal-info-headline');
  // private readonly personCreationFormVornameInput: Locator = this.personCreationForm.getByTestId('add-person-vorname-input').locator('input');
  // private readonly personCreationFormNachnameInput: Locator = this.personCreationForm.getByTestId('add-person-familienname-input').locator('input');
  // private readonly hasNoKopersnrCheckbox: Locator = this.personCreationForm.getByTestId('has-no-kopersnr-checkbox');
  // private readonly personCreationFormKopersInput: Locator = this.personCreationForm.getByTestId('kopersnr-input').locator('input');
  // private readonly organisationHeadline: Locator = this.personCreationForm.getByTestId('organisation-assign-headline');
  // private readonly organisationAutocomplete: Autocomplete = new Autocomplete(this.page, this.personCreationForm.getByTestId('personenkontext-create-organisation-select'));
  // private readonly rolleHeadline: Locator = this.personCreationForm.getByTestId('rolle-assign-headline');
  // private readonly rolleAutocomplete: Autocomplete = new Autocomplete(this.page, this.personCreationForm.getByTestId('rollen-select'));
  // private readonly befristungHeadline: Locator = this.personCreationForm.getByTestId('befristung-assign-headline');
  // private readonly personCreationFormBefristungInput: Locator = this.personCreationForm.getByTestId('befristung-input');
  // private readonly schuljahresendeRadioButton: Locator = this.personCreationForm.getByTestId('schuljahresende-radio-button').locator('input');
  // private readonly unbefristetRadioButton: Locator = this.personCreationForm.getByTestId('unbefristet-radio-button').locator('input');

  // private readonly personCreationFormAbbrechenButton: Locator = this.personCreationForm.getByTestId('person-creation-form-discard-button');
  // private readonly personCreationFormLandesbedienstetenHinzufuegenButton: Locator = this.personCreationForm.getByTestId('person-creation-form-submit-button');

  // /* Bestaetigungspopup */
  // private readonly bestaetigungspopupHeadline: Locator = this.page.getByTestId('add-person-confirmation-dialog-headline');
  // private readonly bestaetigungspopupText: Locator = this.page.getByTestId('add-person-confirmation-text');
  // private readonly bestaetigungspopupAbbrechenButton: Locator = this.page.getByTestId('cancel-add-person-confirmation-button');
  // private readonly bestaetigungspopupLandesbedienstetenHinzufuegenButton: Locator = this.page.getByTestId('confirm-add-person-button');
  // // Erfolgseite
  // private readonly erfolgsseiteErfolgsText: Locator = this.page.getByTestId('state-employee-success-text');
  /*TODO Buttons für spätere Tests
  private readonly erfolgsseiteZurGesamtuebersichtButton: Locator = this.page.getByTestId('to-details-button')
  private readonly erfolgsseiteZurueckZurEgebnislisteButton: Locator = this.page.getByTestId('back-to-list-button')
  private readonly erfolgsseiteWeiterenLandesbedienstetenSuchenButton: Locator = this.page.getByTestId('search-another-landesbediensteter-button')
  */

 /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await this.kopersInput.waitFor({ state: 'visible' });
  }

  // public async fillKopersNr(kopersNr: string): Promise<void> {
  //   if (!(await this.kopersRadioInput.isChecked())) {
  //     await this.kopersRadioInput.check();
  //   }
  //   await this.kopersInput.fill(kopersNr);
  // }

  // public async fillEmail(email: string): Promise<void> {
  //   if (!(await this.emailRadioInput.isChecked())) {
  //     await this.emailRadioInput.check();
  //   }
  //   await this.emailInput.fill(email);
  // }

  // public async fillBenutzername(benutzername: string): Promise<void> {
  //   if (!(await this.usernameRadioInput.isChecked())) {
  //     await this.usernameRadioInput.click();
  //   }
  //   await this.usernameInput.fill(benutzername);
  // }

  public async fillVornameNachname(vorname: string, nachname: string): Promise<void> {
    if (!(await this.nameRadioInput.isChecked())) {
      await this.nameRadioInput.check();
    }
    await this.vornameInput.fill(vorname);
    await this.nachnameInput.fill(nachname);
  }

  // public async checkMandatoryFieldsForNameSearch(vorname: string, nachname: string): Promise<void> {
  //   await this.fillVornameNachname(vorname, nachname);
  //   await this.clickLandesbedienstetenSuchen();
  //   if (vorname === '') {
  //     await expect(this.page.getByTestId('vorname-input').locator('.v-messages__message')).toHaveText('Der Vorname ist erforderlich.');
  //   }
  //   if (nachname === '') {
  //     await expect(this.page.getByTestId('nachname-input').locator('.v-messages__message')).toHaveText('Der Nachname ist erforderlich.');
  //   }
  // }

  // public async clickZuruecksetzen(): Promise<void> {
  //   await this.zuruecksetzenButton.click();
  // }

  // public async clickLandesbedienstetenSuchen(): Promise<void> {
  //   await this.landesbedienstetenSuchenButton.click();
  //}

  public async clickLandesbedienstetenSuchenWithInvalidName(vorname: string, nachname: string): Promise<SearchResultErrorDialog> {
    await this.fillVornameNachname(vorname, nachname);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'));
  }

  // public async searchByName(vorname: string, familienname: string): Promise<void> {
  //   await this.fillVornameNachname(vorname, familienname);
  //   await this.clickLandesbedienstetenSuchen();
  //   await expect(this.personalDataCardFullname).toHaveText(`${vorname} ${familienname}`);
  // }

  // public async goBackToSearchForm(vorname: string, familienname: string): Promise<void> {
  //   await this.zurueckZurSucheButton.click();
  //   await expect(this.personalDataCardFullname).toBeHidden();
  //   await expect(this.nameRadioInput).toBeChecked();
  //   await expect(this.vornameInput).toHaveValue(vorname);
  //   await expect(this.nachnameInput).toHaveValue(familienname);
  // }

  // public async resetSearchForm(): Promise<void> {
  //   await this.zuruecksetzenButton.click();
  //   await expect(this.personalDataCardFullname).toBeHidden();
  //   await expect(this.nameRadioInput).toBeChecked();
  //   await expect(this.vornameInput).toBeEmpty();
  //   await expect(this.nachnameInput).toBeEmpty();
  // }

  // public async searchLandesbedienstetenViaKopers(kopers: string): Promise<void> {
  //   await this.waitForPageLoad();
  //   await this.fillKopersNr(kopers);
  //   await this.clickLandesbedienstetenSuchen();
  //   await this.landesbedienstetenHinzufuegenButton.click();
  // }

  // public async searchLandesbedienstetenViaEmail(email: string): Promise<void> {
  //   await this.waitForPageLoad();
  //   await this.fillEmail(email);
  //   await this.clickLandesbedienstetenSuchen();
  //   await this.landesbedienstetenHinzufuegenButton.click();
  // }

  // public async searchLandesbedienstetenViaUsername(benutzername: string): Promise<void> {
  //   await this.waitForPageLoad();
  //   await this.fillBenutzername(benutzername);
  //   await this.clickLandesbedienstetenSuchen();
  //   await this.landesbedienstetenHinzufuegenButton.click();
  // }

  // public async searchLandesbedienstetenViaName(vorname: string, nachname: string): Promise<void> {
  //   await this.waitForPageLoad();
  //   await this.fillVornameNachname(vorname, nachname);
  //   await this.clickLandesbedienstetenSuchen();
  //   await this.landesbedienstetenHinzufuegenButton.click();
  // }

  // public async landesbedienstetenHinzufuegenAlsLehrkraft(): Promise<void> {
  //   await this.landesbedienstetenSuchenButton.click();
  //   await this.landesbedienstetenHinzufuegenButton.click();
  //   await this.rolleAutocomplete.selectByTitle('LiV');
  //   await this.personCreationFormLandesbedienstetenHinzufuegenButton.click();
  //   await this.bestaetigungspopupLandesbedienstetenHinzufuegenButton.click();
  // }

  // public async selectOrganisation(organisation: string): Promise<void> {
  //   await this.organisationAutocomplete.selectByName(organisation);
  //   /* after selecting an organisation, the rolle row should become visible */
  //   await expect(this.rolleHeadline).toBeVisible();
  //   await expect(this.rolleAutocomplete.isVisible()).toBeTruthy();
  // }

  // public async selectRolle(rolle: string): Promise<void> {
  //   await this.rolleAutocomplete.selectByTitle(rolle);
  // }

  // public async selectRolleWithBefristung(rolle: string): Promise<void> {
  //   await this.rolleAutocomplete.selectByTitle(rolle);
  //   /* after selecting a rolle with a befristung, the befristung elements should become visible */
  //   await expect(this.befristungHeadline).toBeVisible();
  //   await expect(this.personCreationFormBefristungInput).toBeVisible();
  //   await expect(this.schuljahresendeRadioButton).toBeVisible();
  //   await expect(this.unbefristetRadioButton).toBeVisible();
  //   await expect(this.schuljahresendeRadioButton).toBeChecked();
  //   await expect(this.personCreationFormLandesbedienstetenHinzufuegenButton).toBeEnabled();
  // }

  // // TODO: this is not used yet, implement a test case for it
  // public async cancelConfirmationDialog(): Promise<void> {
  //   await this.bestaetigungspopupAbbrechenButton.click();
  //   await expect(this.bestaetigungspopupHeadline).toHaveText('Landesbediensteten hinzufügen');
  //   await expect(this.personCreationFormLandesbedienstetenHinzufuegenButton).toBeEnabled();
  // }

  // public async confirmLandesbedienstetenHinzufuegen(username: string, rolle: string): Promise<void> {
  //   await this.personCreationFormLandesbedienstetenHinzufuegenButton.click();
  //   await this.checkConfirmationDialog();
  //   await expect(this.bestaetigungspopupText).toHaveText(`Wollen Sie ${username} als ${rolle} hinzufügen?`);
  //   await this.bestaetigungspopupLandesbedienstetenHinzufuegenButton.click();
  // }

  /* assertions */
  public async checkSearchForm(): Promise<void> {
    await expect(this.adminHeadline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('search-state-employee-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    await expect(this.kopersRadioInput).toBeChecked();
    await expect(this.kopersInput).toBeVisible();
    await expect(this.emailRadioInput).toBeVisible();
    await expect(this.emailInput).toBeHidden();
    await expect(this.usernameRadioInput).toBeVisible();
    await expect(this.usernameInput).toBeHidden();
    await expect(this.nameRadioInput).toBeVisible();
    await expect(this.vornameInput).toBeHidden();
    await expect(this.nachnameInput).toBeHidden();
    await expect(this.zuruecksetzenButton).toBeEnabled();
    await expect(this.landesbedienstetenSuchenButton).toBeDisabled();
  }

  // public async checkSearchResultCard(): Promise<void> {
  //   await expect(this.page.getByTestId('layout-card-headline-search-result')).toHaveText('Suchergebnis');
  //   await expect(this.landesbedienstetenHinzufuegenButton).toBeVisible();
  //   await expect(this.zurueckZurSucheButton).toBeVisible();
  // }

  // public async checkPersonalDataCard(
  //   fullName: string, username: string, kopersnummer: string, email: string
  // ): Promise<void> {
  //   await expect(this.page.getByTestId('layout-card-headline-personal-data')).toHaveText('Persönliche Daten');
  //   await expect(this.personalDataCardFullname).toHaveText(fullName);
  //   await expect(this.page.getByTestId('username-value')).toHaveText(username);
  //   // TODO: email and kopers have to be optional
  //   // await expect(this.page.getByTestId('kopersnummer-value')).toHaveText(kopersnummer);
  //   // await expect(this.page.getByTestId('person-email-value')).toHaveText(email);
  // }

  // // TODO: rewrite this function to iterate all zuordnungen
  // public async checkZuordnungCards(organisation: string, rolle: string, dienststellennummer: string): Promise<void> {
  //   await expect(this.page.getByTestId('zuordnung-card-1-headline')).toHaveText('Schulzuordnung');
  //   await expect(this.page.getByTestId('organisation-value-1')).toHaveText(organisation);
  //   await expect(this.page.getByTestId('rolle-value-1')).toHaveText(rolle);
  //   await expect(this.page.getByTestId('dienststellennummer-value-1')).toHaveText(dienststellennummer);
  // }

  // public async checkConfirmationDialog(): Promise<void> {
  //   await expect(this.landesbedienstetenHinzufuegenHeadline).toBeVisible();
  //   await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
  //   await expect(this.bestaetigungspopupText).toBeVisible();
  //   await expect(this.bestaetigungspopupAbbrechenButton).toBeVisible();
  //   await expect(this.bestaetigungspopupAbbrechenButton).toHaveText('Abbrechen');
  //   await expect(this.bestaetigungspopupLandesbedienstetenHinzufuegenButton).toBeVisible();
  //   await expect(this.bestaetigungspopupLandesbedienstetenHinzufuegenButton).toHaveText('Landesbediensteten hinzufügen');
  // }
  // /*
  // TODO: Hier ist er auf der falschen Seite
  // */
  // public async checkMinimalCreationForm(vorname: string, nachname: string, kopersnummer: string): Promise<void> {
  //   await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
  //   await expect(this.mandatoryFieldsNotice).toHaveText('Mit * markierte Felder sind Pflichtangaben.');
  //   await expect(this.closeButton).toBeVisible();

  //   await expect(this.personalInfoHeadline).toBeVisible();
  //   await expect(this.personCreationFormVornameInput).toHaveValue(vorname);
  //   await expect(this.personCreationFormNachnameInput).toHaveValue(nachname);
  //   await expect(this.personCreationFormKopersInput).toHaveValue(kopersnummer);
  //   await expect(this.hasNoKopersnrCheckbox).toBeVisible();

  //   await expect(this.personCreationFormAbbrechenButton).toBeVisible();
  //   await expect(this.personCreationFormLandesbedienstetenHinzufuegenButton).toBeDisabled();
  // }

  // public async checkCreationFormWithOrganisation(vorname: string, nachname: string, kopersnummer: string, organisationText: string): Promise<void> {
  //   await this.checkMinimalCreationForm(vorname, nachname, kopersnummer);
  //   await expect(this.organisationHeadline).toBeVisible();
  //   await this.organisationAutocomplete.checkText(organisationText);
  // }

  // public async checkFullCreationForm(vorname: string, nachname: string, kopersnummer: string, organisationText: string, rolleText: string): Promise<void> {
  //   await this.checkCreationFormWithOrganisation(vorname, nachname, kopersnummer, organisationText);
  //   await expect(this.rolleHeadline).toBeVisible();
  //   await this.rolleAutocomplete.checkText(rolleText);
  // }

  // public async checkSelectableOrganisationen(expectedOrganisationen: string[]): Promise<void> {
  //   await this.organisationAutocomplete.assertAllMenuItems(expectedOrganisationen);
  // }

  // public async checkSuccessPage(vorname: string, nachname: string, kopersnummer: string, username: string, organisation: string): Promise<void> {
  //   await expect(this.adminHeadline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
  //   await expect(this.landesbedienstetenHinzufuegenHeadline).toHaveText('Landesbediensteten hinzufügen');
  //   await expect(this.erfolgsseiteErfolgsText).toHaveText(`${vorname} ${nachname} wurde erfolgreich hinzugefügt.`);
  //   await expect(this.page.getByTestId('following-data-added-text')).toHaveText('Folgende Daten wurden gespeichert:');
  //   await expect(this.page.getByTestId('added-state-employee-vorname-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-vorname')).toHaveText(vorname);
  //   await expect(this.page.getByTestId('added-state-employee-familienname-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-familienname')).toHaveText(nachname);
  //   await expect(this.page.getByTestId('added-state-employee-personalnummer-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-personalnummer')).toHaveText(kopersnummer);
  //   await expect(this.page.getByTestId('added-state-employee-username-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-username')).toHaveText(username);
  //   await expect(this.page.getByTestId('added-state-employee-organisation-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-organisation')).toHaveText(organisation);
  //   await expect(this.page.getByTestId('added-state-employee-rolle-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-rolle')).toHaveText('LiV');
  //   await expect(this.page.getByTestId('added-state-employee-befristung-label')).toBeVisible();
  //   await expect(this.page.getByTestId('added-state-employee-befristung')).toBeVisible();
  //   await expect(this.page.getByTestId('go-to-details-button')).toHaveText('Zur Gesamtübersicht');
  //   await expect(this.page.getByTestId('back-to-list-button')).toHaveText('Zurück zur Ergebnisliste');
  //   await expect(this.page.getByTestId('search-another-state-employee-button')).toHaveText('Weiteren Landesbediensteten suchen');
  // }
}