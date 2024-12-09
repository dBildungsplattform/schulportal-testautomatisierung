import { type Locator, Page } from '@playwright/test';

export class KlasseDetailsViewPage {
  readonly page: Page;
  readonly button_Schliessen: Locator;
  readonly text_h2_KlasseBearbeiten: Locator;
  readonly text_h3_SchuleZuordnen: Locator;
  readonly text_h3_KlassennameEingeben: Locator;
  readonly button_KlasseLoeschenDialog: Locator;
  readonly button_KlasseLoeschen: Locator;
  readonly button_Bearbeiten: Locator;
  readonly button_Speichern: Locator;
  readonly button_Abbrechen: Locator;
  readonly combobox_Schulstrukturknoten: Locator;
  readonly input_Klassenname: Locator;
  readonly text_success: Locator;
  readonly icon_success: Locator;
  readonly text_DatenGespeichert: Locator;
  readonly label_Schule: Locator;
  readonly data_Schule: Locator;
  readonly label_Klasse: Locator;
  readonly data_Klasse: Locator;
  readonly button_ZurueckErgebnisliste: Locator;

  constructor(page) {
    this.page = page;
    this.button_Schliessen = page.getByTestId('close-layout-card-button');
    this.text_h2_KlasseBearbeiten = page.getByTestId('klasse-details-card');
    this.text_h3_SchuleZuordnen = page.getByText('1. Schule zuordnen');
    this.text_h3_KlassennameEingeben = page.getByText('2. Klassenname eingeben');
    this.button_KlasseLoeschenDialog = page.getByTestId('open-klasse-delete-dialog-button');
    this.button_KlasseLoeschen = page.getByTestId('klasse-delete-button');
    this.button_Bearbeiten = page.getByTestId('klasse-edit-button');
    this.button_Speichern = page.getByTestId('klasse-changes-save-button');
    this.button_Abbrechen = page.getByTestId('klasse-edit-cancel-button');
    this.combobox_Schulstrukturknoten = page.getByTestId('schule-select').locator('.v-input__control');
    this.input_Klassenname = page.getByTestId('klassenname-input').locator('input');
    this.text_success = page.getByTestId('klasse-success-text');
    this.icon_success = page.locator('.mdi-check-circle');
    this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
    this.label_Schule = page.getByText('Schule:', { exact: true });
    this.data_Schule = page.getByTestId('created-klasse-schule');
    this.label_Klasse = page.getByText('Klassenname:', { exact: true });
    this.data_Klasse = page.getByTestId('created-klasse-name');
    this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
  }

  public async klasseBearbeiten(klasseName: string) {
    await this.button_Bearbeiten.click();
    await this.input_Klassenname.fill(klasseName);
    await this.button_Speichern.click();
  }
}