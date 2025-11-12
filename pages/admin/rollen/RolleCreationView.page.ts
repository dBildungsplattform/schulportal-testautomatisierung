import { type Locator, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { MenuPage } from '../../components/MenuBar.page';
import { RolleCreationConfirmPage } from './RolleCreationConfirm.page';

export class RolleCreationViewPage {
  readonly rolleForm: RolleForm;
  readonly textH2RolleAnlegen: Locator;
  readonly buttonSchliessen: Locator;
  readonly buttonRolleAnlegen: Locator;
  readonly buttonWeitereRolleAnlegen: Locator;
  readonly buttonZurueckErgebnisliste: Locator;
  readonly textSuccess: Locator;
  readonly iconSuccess: Locator;
  readonly textDatenGespeichert: Locator;

  constructor(public readonly page: Page) {
    // Anlage Rolle
    this.rolleForm = new RolleForm(page);
    this.textH2RolleAnlegen = page.getByTestId('rolle-creation-headline');
    this.buttonSchliessen = page.getByTestId('close-layout-card-button');
    this.buttonRolleAnlegen = page.getByTestId('rolle-form-submit-button');
    this.buttonWeitereRolleAnlegen = page.getByTestId('create-another-rolle-button');
    // Bestätigungsseite Rolle
    this.buttonZurueckErgebnisliste = page.getByTestId('back-to-list-button');
    this.textSuccess = page.getByTestId('rolle-success-text');
    this.iconSuccess = page.locator('.mdi-check-circle');
    this.textDatenGespeichert = page.getByText('Folgende Daten wurden gespeichert:');
  }

  public async enterRollenname(name: string): Promise<void> {
    await this.rolleForm.enterRollenname(name);
  }

  public async createRolle(): Promise<RolleCreationConfirmPage> {
    await this.buttonRolleAnlegen.click();
    return new RolleCreationConfirmPage(this.page);
  }

  public menu(): MenuPage {
    return new MenuPage(this.page);
  }
}
