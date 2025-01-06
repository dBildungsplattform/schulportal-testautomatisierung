import { type Locator, Page } from '@playwright/test';
import { RolleForm } from '../../components/RolleForm';
import { MenuPage } from '../MenuBar.page';
import { RolleCreationConfirmPage } from './RolleCreationConfirm.page';

export class RolleCreationViewPage {
  readonly rolleForm: RolleForm;
  readonly text_h2_RolleAnlegen: Locator;
  readonly button_Schliessen: Locator;
  readonly button_RolleAnlegen: Locator;
  readonly button_WeitereRolleAnlegen: Locator;
  readonly button_ZurueckErgebnisliste: Locator;
  readonly text_success: Locator;
  readonly icon_success: Locator;
  readonly text_DatenGespeichert: Locator;

  constructor(public readonly page: Page) {
    // Anlage Rolle
    this.rolleForm = new RolleForm(page);
    this.text_h2_RolleAnlegen = page.getByTestId('layout-card-headline');
    this.button_Schliessen = page.getByTestId('close-layout-card-button');
    this.button_RolleAnlegen = page.getByTestId('rolle-form-submit-button');
    this.button_WeitereRolleAnlegen = page.getByTestId('create-another-rolle-button');
    // Bestätigungsseite Rolle
    this.button_ZurueckErgebnisliste = page.getByTestId('back-to-list-button');
    this.text_success = page.getByTestId('rolle-success-text');
    this.icon_success = page.locator('.mdi-check-circle');
    this.text_DatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
  }

  public async enterRollenname(name: string): Promise<void> {
    await this.rolleForm.enterRollenname(name);
  }

  public async createRolle(): Promise<RolleCreationConfirmPage> {
    await this.button_RolleAnlegen.click();
    return new RolleCreationConfirmPage(this.page);
  }

  public menu(): MenuPage {
    return new MenuPage(this.page);
  }
}
