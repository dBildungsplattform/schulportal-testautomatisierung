import { type Locator, Page } from '@playwright/test';

export class KlasseDetailsViewPage {
  readonly page: Page;
  readonly buttonSchliessen: Locator;
  readonly textH2KlasseBearbeiten: Locator;
  readonly textH3SchuleZuordnen: Locator;
  readonly textH3KlassennameEingeben: Locator;
  readonly buttonKlasseLoeschenDialog: Locator;
  readonly buttonKlasseLoeschen: Locator;
  readonly buttonKlasseLoeschenClose: Locator;
  readonly buttonBearbeiten: Locator;
  readonly buttonSpeichern: Locator;
  readonly buttonAbbrechen: Locator;
  readonly comboboxSchulstrukturknoten: Locator;
  readonly inputKlassenname: Locator;
  readonly textSuccess: Locator;
  readonly iconSuccess: Locator;
  readonly textDatenGespeichert: Locator;
  readonly labelSchule: Locator;
  readonly dataSchule: Locator;
  readonly labelKlasse: Locator;
  readonly dataKlasse: Locator;
  readonly buttonZurueckErgebnisliste: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonSchliessen = page.getByTestId('close-layout-card-button');
    this.textH2KlasseBearbeiten = page.getByTestId('klasse-details-card');
    this.textH3SchuleZuordnen = page.getByText('1. Schule zuordnen');
    this.textH3KlassennameEingeben = page.getByText('2. Klassenname eingeben');
    this.buttonKlasseLoeschenDialog = page.getByTestId('open-klasse-delete-dialog-button');
    this.buttonKlasseLoeschen = page.getByTestId('klasse-delete-button');
    this.buttonKlasseLoeschenClose = page.getByTestId('close-klasse-delete-success-dialog-button');
    this.buttonBearbeiten = page.getByTestId('klasse-edit-button');
    this.buttonSpeichern = page.getByTestId('klasse-form-submit-button');
    this.buttonAbbrechen = page.getByTestId('klasse-form-discard-button');
    this.comboboxSchulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control');
    this.inputKlassenname = page.getByTestId('klassenname-input').locator('input');
    this.textSuccess = page.getByTestId('klasse-success-text');
    this.iconSuccess = page.locator('.mdi-check-circle');
    this.textDatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
    this.labelSchule = page.getByText('Schule:', { exact: true });
    this.dataSchule = page.getByTestId('created-klasse-schule');
    this.labelKlasse = page.getByText('Klassenname:', { exact: true });
    this.dataKlasse = page.getByTestId('created-klasse-name');
    this.buttonZurueckErgebnisliste = page.getByTestId('back-to-list-button');
  }

  public async klasseBearbeiten(klasseName: string) {
    await this.buttonBearbeiten.click();
    await this.inputKlassenname.fill(klasseName);
    await this.buttonSpeichern.click();
  }

  public async deleteClass() {
    await this.buttonKlasseLoeschenDialog.click();
    await this.buttonKlasseLoeschen.click();
    await this.buttonKlasseLoeschenClose.click();
  }

  public async startDeleteRowViaQuickAction() {
    await this.buttonKlasseLoeschenDialog.click();
    await this.buttonKlasseLoeschen.click();
  }
}