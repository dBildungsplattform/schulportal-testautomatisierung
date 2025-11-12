import { type Locator, Page } from '@playwright/test';
import { RolleManagementViewPage } from './RolleManagementView.page';

export class RolleCreationConfirmPage {
  public readonly confirmationMessage: Locator;
  public readonly textH2RolleAnlegen: Locator;
  public readonly buttonSchliessen: Locator;
  public readonly textSuccess: Locator;
  public readonly iconSuccess: Locator;
  public readonly labelRollenart: Locator;
  public readonly dataRollenart: Locator;
  public readonly labelRollenname: Locator;
  public readonly dataRollenname: Locator;
  public readonly labelMerkmale: Locator;
  public readonly dataMerkmale: Locator;
  public readonly labelAngebote: Locator;
  public readonly dataAngebote: Locator;
  public readonly labelSystemrechte: Locator;
  public readonly dataSystemrechte: Locator;
  public readonly textDatenGespeichert: Locator;
  public readonly labelAdministrationsebene: Locator;
  public readonly dataAdministrationsebene: Locator;
  public readonly buttonZurueckErgebnisliste: Locator;
  public readonly buttonWeitereRolleAnlegen: Locator;

  constructor(private page: Page) {
    this.confirmationMessage = this.page.getByText('Folgende Daten wurden gespeichert:');
    this.textH2RolleAnlegen = this.page.getByTestId('rolle-creation-headline');
    this.buttonSchliessen = this.page.getByTestId('close-layout-card-button');
    this.textSuccess = this.page.getByTestId('rolle-success-text');
    this.iconSuccess = this.page.locator('.mdi-check-circle');
    this.labelRollenart = this.page.getByText('Rollenart:', { exact: true });
    this.dataRollenart = this.page.getByTestId('created-rolle-rollenart');
    this.labelRollenname = this.page.getByText('Rollenname:', { exact: true });
    this.dataRollenname = this.page.getByTestId('created-rolle-name');
    this.labelMerkmale = this.page.getByText('Merkmale:', { exact: true });
    this.dataMerkmale = this.page.getByTestId('created-rolle-merkmale');
    this.labelAngebote = this.page.getByText('Zugeordnete Angebote:', { exact: true });
    this.dataAngebote = this.page.getByTestId('created-rolle-angebote');
    this.labelSystemrechte = this.page.getByText('Systemrechte:', { exact: true });
    this.dataSystemrechte = this.page.getByTestId('created-rolle-systemrecht');
    this.textDatenGespeichert = this.page.getByText('Folgende Daten wurden gespeichert:');
    this.labelAdministrationsebene = this.page.getByText('Administrationsebene:', { exact: true });
    this.dataAdministrationsebene = this.page.getByTestId('created-rolle-administrationsebene');
    this.buttonZurueckErgebnisliste = this.page.getByTestId('back-to-list-button');
    this.buttonWeitereRolleAnlegen = this.page.getByTestId('create-another-rolle-button');
  }

  public async backToResultList(): Promise<RolleManagementViewPage> {
    await this.buttonZurueckErgebnisliste.click();

    return new RolleManagementViewPage(this.page);
  }
}
