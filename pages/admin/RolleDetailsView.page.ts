import { type Locator, Page } from '@playwright/test';
import { RolleForm } from '../../components/RolleForm';
import { MenuPage } from '../MenuBar.page';

export class RolleDetailsViewPage {
  readonly rolleForm: RolleForm;
  readonly text_h2_RolleAnlegen: Locator;
  readonly button_Schliessen: Locator;
  readonly button_RolleBearbeiten: Locator;
  readonly button_RolleBearbeitenAbbrechen: Locator;
  readonly button_RolleBearbeitenSpeichern: Locator;
  readonly button_RolleLoeschen: Locator;
  readonly button_RolleLoeschenConfirm: Locator;
  readonly button_RolleLoeschenCancel: Locator;
  readonly button_ZurueckErgebnisliste: Locator;
  readonly text_success: Locator;
  readonly icon_success: Locator;
  readonly alert: { title: Locator; text: Locator; button: Locator };

  constructor(public readonly page: Page) {
    this.rolleForm = new RolleForm(page);
    this.button_RolleBearbeiten = page.getByTestId('rolle-edit-button');
    this.button_RolleLoeschen = page.getByTestId('open-rolle-delete-dialog-button');
    this.button_RolleLoeschenConfirm = page.getByTestId('rolle-delete-button');
    this.button_RolleLoeschenCancel = page.getByTestId('cancel-rolle-delete-button');
    this.text_success = page.getByTestId('rolle-delete-success-text');
    this.alert = {
      title: page.getByTestId('alert-title'),
      text: page.getByTestId('alert-text'),
      button: page.getByTestId('alert-button'),
    };
  }

  public menu(): MenuPage {
    return new MenuPage(this.page);
  }

  public async startEdit(): Promise<void> {
    await this.button_RolleBearbeiten.click();
  }

  public async saveEdit(): Promise<void> {
    await this.button_RolleBearbeitenSpeichern.click();
  }

  public async cancelEdit(): Promise<void> {
    await this.button_RolleBearbeitenAbbrechen.click();
  }

  public async deleteRolle(): Promise<void> {
    await this.button_RolleLoeschen.click();
    await this.button_RolleLoeschenConfirm.click();
  }
}
