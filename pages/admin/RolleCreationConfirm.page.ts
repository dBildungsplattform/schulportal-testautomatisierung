import { type Locator, Page } from '@playwright/test';
import { RolleManagementViewPage } from './RolleManagementView.page';

export class RolleCreationConfirmPage {
  constructor(private page: Page) {}

  public readonly confirmationMessage: Locator = this.page.getByText('Folgende Daten wurden gespeichert:');
  public readonly textH2RolleAnlegen: Locator = this.page.getByTestId('layout-card-headline');
  public readonly buttonSchliessen: Locator = this.page.getByTestId('close-layout-card-button');
  public readonly textSuccess: Locator = this.page.getByTestId('rolle-success-text');
  public readonly iconSuccess: Locator = this.page.locator('.mdi-check-circle');
  public readonly labelRollenart: Locator = this.page.getByText('Rollenart:', {
    exact: true,
  });
  public readonly dataRollenart: Locator = this.page.getByTestId('created-rolle-rollenart');
  public readonly labelRollenname: Locator = this.page.getByText('Rollenname:', {
    exact: true,
  });
  public readonly dataRollenname: Locator = this.page.getByTestId('created-rolle-name');
  public readonly labelMerkmale: Locator = this.page.getByText('Merkmale:', {
    exact: true,
  });
  public readonly dataMerkmale: Locator = this.page.getByTestId('created-rolle-merkmale');
  public readonly labelAngebote: Locator = this.page.getByText('Zugeordnete Angebote:', {
    exact: true,
  });
  public readonly dataAngebote: Locator = this.page.getByTestId('created-rolle-angebote');
  public readonly labelSystemrechte: Locator = this.page.getByText('Systemrechte:', {
    exact: true,
  });
  public readonly dataSystemrechte: Locator = this.page.getByTestId('created-rolle-systemrecht');

  public readonly textDatenGespeichert: Locator = this.page.getByText('Folgende Daten wurden gespeichert:');

  public readonly labelAdministrationsebene: Locator = this.page.getByText('Administrationsebene:', {
    exact: true,
  });
  public readonly dataAdministrationsebene: Locator = this.page.getByTestId('created-rolle-administrationsebene');
  public readonly buttonZurueckErgebnisliste: Locator = this.page.getByTestId('back-to-list-button');
  public readonly buttonWeitereRolleAnlegen: Locator = this.page.getByTestId('create-another-rolle-button');

  public async backToResultList(): Promise<RolleManagementViewPage> {
    await this.buttonZurueckErgebnisliste.click();

    return new RolleManagementViewPage(this.page);
  }
}
