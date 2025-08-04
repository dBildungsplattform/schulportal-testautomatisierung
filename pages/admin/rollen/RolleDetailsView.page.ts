import { type Locator, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { MenuPage } from '../../components/MenuBar.page';

export class RolleDetailsViewPage {
  readonly rolleForm: RolleForm;
  readonly textH2RolleAnlegen: Locator;
  readonly buttonSchliessen: Locator;
  readonly buttonRolleBearbeiten: Locator;
  readonly buttonRolleBearbeitenAbbrechen: Locator;
  readonly buttonRolleBearbeitenSpeichern: Locator;
  readonly buttonRolleLoeschen: Locator;
  readonly buttonRolleLoeschenConfirm: Locator;
  readonly buttonRolleLoeschenCancel: Locator;
  readonly buttonZurueckErgebnisliste: Locator;
  readonly textSuccess: Locator;
  readonly iconSuccess: Locator;
  readonly alert: { title: Locator; text: Locator; button: Locator };

  constructor(public readonly page: Page) {
    this.rolleForm = new RolleForm(page);
    this.buttonRolleBearbeiten = page.getByTestId('rolle-edit-button');
    this.buttonRolleLoeschen = page.getByTestId('open-rolle-delete-dialog-button');
    this.buttonRolleLoeschenConfirm = page.getByTestId('rolle-delete-button');
    this.buttonRolleLoeschenCancel = page.getByTestId('cancel-rolle-delete-button');
    this.textSuccess = page.getByTestId('rolle-delete-success-text');
    this.alert = {
      title: page.getByTestId('rolle-details-error-alert-title'),
      text: page.getByTestId('rolle-details-error-alert-text'),
      button: page.getByTestId('alert-button'),
    };
  }

  public menu(): MenuPage {
    return new MenuPage(this.page);
  }

  public async startEdit(): Promise<void> {
    await this.buttonRolleBearbeiten.click();
  }

  public async saveEdit(): Promise<void> {
    await this.buttonRolleBearbeitenSpeichern.click();
  }

  public async cancelEdit(): Promise<void> {
    await this.buttonRolleBearbeitenAbbrechen.click();
  }

  public async deleteRolle(): Promise<void> {
    await this.buttonRolleLoeschen.click();
    await this.buttonRolleLoeschenConfirm.click();
  }
}
