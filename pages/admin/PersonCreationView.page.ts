import { expect, type Locator, Page } from '@playwright/test';
import { waitForAPIResponse } from '../../base/api/testHelper.page';
import { ComboBox } from '../../elements/ComboBox';

/*<<<<<<< HEAD
export class PersonCreationViewPage{
    readonly page: Page;
    readonly body: Locator;
    readonly text_h2_PersonAnlegen: Locator;
    readonly button_Schliessen: Locator;
    readonly combobox_Rolle: Locator;
    readonly combobox_Rolle_Clear: Locator;
    readonly Input_Vorname: Locator;
    readonly Input_Nachname: Locator;
    readonly Input_Kopersnr: Locator;
    readonly combobox_Schulstrukturknoten: Locator;
    readonly combobox_Schulstrukturknoten_Clear: Locator;
    readonly combobox_Klasse: Locator;
    readonly button_PersonAnlegen: Locator;
    readonly text_success: Locator;
    readonly icon_success: Locator;
    readonly text_DatenGespeichert: Locator;
    readonly text_Bestaetigungsseite_Benutzernachname: Locator;
    readonly input_EinstiegsPasswort: Locator;
    readonly label_EinstiegsPasswort: Locator;
    readonly button_ZurGesamtuebersicht: Locator;
    readonly button_ZurueckErgebnisliste: Locator;
    readonly button_WeiterenBenutzerAnlegen: Locator;
    readonly label_Vorname: Locator;
    readonly data_Vorname: Locator;
    readonly label_Nachname: Locator;
    readonly data_Nachname: Locator;
    readonly label_Benutzername: Locator;
    readonly data_Benutzername: Locator;
    readonly label_Rolle: Locator;
    readonly data_Rolle: Locator;
    readonly label_Organisationsebene: Locator;
    readonly data_Organisationsebene: Locator;
    readonly label_Klasse: Locator;
    readonly data_Klasse: Locator;
    readonly listbox_Rolle: Locator;
    readonly comboboxOrganisationInput: ComboBox;
    readonly organisation: Locator;
    readonly organisationInput: Locator;
=======*/
export class PersonCreationViewPage {
  readonly page: Page;
  readonly body: Locator;
  readonly textH2PersonAnlegen: Locator;
  readonly buttonSchliessen: Locator;
  readonly comboboxRolle: Locator;
  readonly comboboxRolleClear: Locator;
  readonly inputVorname: Locator;
  readonly inputNachname: Locator;
  readonly inputKopersnr: Locator;
  readonly comboboxSchulstrukturknoten: Locator;
  readonly comboboxSchulstrukturknotenClear: Locator;
  readonly comboboxKlasse: Locator;
  readonly buttonPersonAnlegen: Locator;
  readonly textSuccess: Locator;
  readonly iconSuccess: Locator;
  readonly textDatenGespeichert: Locator;
  readonly textBestaetigungsseiteBenutzernachname: Locator;
  readonly inputEinstiegsPasswort: Locator;
  readonly labelEinstiegsPasswort: Locator;
  readonly buttonZurueckErgebnisliste: Locator;
  readonly buttonWeiterenBenutzerAnlegen: Locator;
  readonly buttonOpenGesamtuebersicht: Locator;

  readonly labelVorname: Locator;
  readonly dataVorname: Locator;
  readonly labelNachname: Locator;
  readonly dataNachname: Locator;
  readonly labelBenutzername: Locator;
  readonly dataBenutzername: Locator;
  readonly labelRolle: Locator;
  readonly dataRolle: Locator;
  readonly labelOrganisationsebene: Locator;
  readonly dataOrganisationsebene: Locator;
  readonly labelKlasse: Locator;
  readonly dataKlasse: Locator;
  readonly listboxRolle: Locator;
  readonly comboboxOrganisationInput: ComboBox;
  readonly organisation: Locator;
  readonly organisationInput: Locator;
  readonly comboboxRolleInput: ComboBox;
  readonly rolleInput: Locator;

/*<<<<<<< HEAD
        // Bestätigungsseite Klasse
        this.text_success = page.getByTestId('person-success-text');
        this.icon_success = page.locator('.mdi-check-circle');
        this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
        this.label_Vorname =  page.getByText('Vorname:', { exact: true });
        this.data_Vorname =  page.getByTestId('created-person-vorname');
        this.label_Nachname =  page.getByText('Nachname:', { exact: true });
        this.data_Nachname =  page.getByTestId('created-person-familienname');
        this.label_Benutzername =  page.getByText('Benutzername:', { exact: true });
        this.data_Benutzername = page.getByTestId('created-person-username');
        this.label_Rolle =  page.getByText('Rolle:', { exact: true });
        this.data_Rolle = page.getByTestId('created-person-rolle');
        this.label_Organisationsebene = page.getByText('Organisationsebene:', { exact: true });
        this.data_Organisationsebene =  page.getByTestId('created-person-organisation');
        this.label_Klasse =  page.getByText('Klasse:', { exact: true });
        this.data_Klasse =  page.getByTestId('created-person-klasse');
        this.label_EinstiegsPasswort =  page.getByText(' Einstiegs-Passwort:', { exact: true });
        this.input_EinstiegsPasswort = page.locator('[data-testid="password-output-field"] input');
        this.button_ZurGesamtuebersicht = page.getByTestId('to-details-button');
        this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
        this.button_WeiterenBenutzerAnlegen = page.getByTestId('create-another-person-button');
        this.listbox_Rolle = page.locator('.v-list');
=======*/
  constructor(page: Page) {
    // Anlage Person
    this.page = page;
    this.body = page.locator('body');
    this.textH2PersonAnlegen = page.getByTestId('layout-card-headline');
    this.buttonSchliessen = page.getByTestId('close-layout-card-button');
    this.comboboxRolle = page.getByTestId('rollen-select').locator('.v-field__input');
    this.comboboxRolleClear = page.getByTestId('rollen-select').getByLabel('leeren');
    this.comboboxSchulstrukturknotenClear = page.getByTestId('organisation-select').getByLabel('leeren');
    this.organisation = page.getByTestId('organisation-select').locator('.v-field');
    this.organisationInput = page.getByTestId('organisation-select');
    this.inputVorname = page.getByTestId('vorname-input').locator('.v-field__input');
    this.inputNachname = page.getByTestId('familienname-input').locator('.v-field__input');
    this.inputKopersnr = page.getByTestId('kopersnr-input').locator('.v-field__input');
    this.comboboxSchulstrukturknoten = page.getByTestId('organisation-select').locator('.v-field__input');
    this.comboboxKlasse = page.getByTestId('personenkontext-create-klasse-select').locator('.v-field__input');
    this.buttonPersonAnlegen = page.getByTestId('person-creation-form-submit-button');
    this.comboboxOrganisationInput = new ComboBox(this.page, this.organisationInput);
    this.rolleInput = page.getByTestId('rollen-select');
    this.comboboxRolleInput = new ComboBox(this.page, this.rolleInput);

    // Bestätigungsseite Klasse
    this.textSuccess = page.getByTestId('person-success-text');
    this.iconSuccess = page.locator('.mdi-check-circle');
    this.textDatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
    this.labelVorname = page.getByText('Vorname:', { exact: true });
    this.dataVorname = page.getByTestId('created-person-vorname');
    this.labelNachname = page.getByText('Nachname:', { exact: true });
    this.dataNachname = page.getByTestId('created-person-familienname');
    this.labelBenutzername = page.getByText('Benutzername:', { exact: true });
    this.dataBenutzername = page.getByTestId('created-person-username');
    this.labelRolle = page.getByText('Rolle:', { exact: true });
    this.dataRolle = page.getByTestId('created-person-rolle');
    this.labelOrganisationsebene = page.getByText('Organisationsebene:', { exact: true });
    this.dataOrganisationsebene = page.getByTestId('created-person-organisation');
    this.labelKlasse = page.getByText('Klasse:', { exact: true });
    this.dataKlasse = page.getByTestId('created-person-klasse');
    this.labelEinstiegsPasswort = page.getByText(' Einstiegs-Passwort:', { exact: true });
    this.inputEinstiegsPasswort = page.locator('[data-testid="password-output-field"] input');
    this.buttonZurueckErgebnisliste = page.getByTestId('back-to-list-button');
    this.buttonWeiterenBenutzerAnlegen = page.getByTestId('create-another-person-button');
    this.buttonOpenGesamtuebersicht = page.getByTestId('to-details-button');

    this.listboxRolle = page.locator('.v-list');
  }

  public async validateConfirmationPage(
    firstName: string,
    lastName: string,
    rolleNames: string[],
    officeNo: string,
    organisation: string
  ): Promise<void> {
    await expect(this.textH2PersonAnlegen).toBeVisible();
    await expect(this.buttonSchliessen).toBeVisible();
    await expect(this.textSuccess).toHaveText(firstName + ' ' + lastName + ' wurde erfolgreich hinzugefügt.');
    await expect(this.textDatenGespeichert).toBeVisible();
    await expect(this.labelVorname).toHaveText('Vorname:');
    await expect(this.dataVorname).toHaveText(firstName);
    await expect(this.labelNachname).toHaveText('Nachname:');
    await expect(this.dataNachname).toHaveText(lastName);
    await expect(this.labelBenutzername).toHaveText('Benutzername:');
    await expect(this.dataBenutzername).toContainText('tautopw');
    await expect(this.labelEinstiegsPasswort).toHaveText('Einstiegs-Passwort:');
    await expect(this.inputEinstiegsPasswort).toBeVisible();
    await expect(this.labelRolle).toHaveText('Rolle:');
    for (const index in rolleNames) {
      await expect(this.dataRolle).toContainText(rolleNames[index]);
    }
    await expect(this.labelOrganisationsebene).toHaveText('Organisationsebene:');
    await expect(this.dataOrganisationsebene).toHaveText(officeNo + ' (' + organisation + ')');
    await expect(this.buttonWeiterenBenutzerAnlegen).toBeVisible();
    await expect(this.buttonZurueckErgebnisliste).toBeVisible();
  }

  public async createUser(
    organisation: string,
    rolle: string,
    firstName: string,
    lastnName: string,
    koPersNr?: string
  ): Promise<void> {
    await this.comboboxOrganisationInput.searchByTitle(organisation, false);

    await this.comboboxRolleInput.searchByTitle(rolle, true);
    await this.inputVorname.fill(firstName);
    await this.inputNachname.fill(lastnName);
    if (koPersNr) {
      await this.inputKopersnr.fill(koPersNr);
    }
    await this.buttonPersonAnlegen.click();
  }

  public async clearOrganisationSelection(): Promise<void> {
    await this.comboboxOrganisationInput.clear();
    await waitForAPIResponse(this.page, 'personenkontext-workflow/**');
  }

  public async searchAndSelectOrganisation(organisation: string, exact: boolean): Promise<void> {
    await this.comboboxOrganisationInput.searchByTitle(organisation, exact, 'personenkontext-workflow/**');
  }
  
  public async checkRolleModal(includes: string[], excludes: string[]): Promise<void> {
    await this.comboboxRolleInput.openModal();
    for (const role of includes) {
      await expect(this.listboxRolle).toContainText(role);
    }
    for (const role of excludes) {
      await expect(this.listboxRolle).not.toContainText(role);
    }
    await this.comboboxRolleInput.closeModal();
  }
}
