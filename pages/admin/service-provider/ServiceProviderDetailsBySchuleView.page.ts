import { expect, Locator, Page } from '@playwright/test';
import { ServiceProviderKategorie } from '../../../base/api/generated';
import { KATEGORIE_LABEL } from '../../../base/sp';
import { MenuBarPage } from '../../components/MenuBar.page';

export class ServiceProviderDetailsBySchuleViewPage {
  private readonly card: Locator;
  private readonly serviceProviderDetailsHeadline: Locator;
  private readonly closeButton: Locator;
  private readonly nameField: Locator;
  private readonly administrationsebeneField: Locator;
  private readonly requires2faField: Locator;
  private readonly canBeAssignedToRollenField: Locator;
  private readonly kategorieField: Locator;
  private readonly linkField: Locator;
  private readonly rollenerweiterungField: Locator;
  private readonly rollenerweiterungenField: Locator;
  private readonly rollenerweiterungenHeadline: Locator;
  private readonly rollenerweiterungBearbeitenButton: Locator;
  private readonly rollenerweiterungBaumGruppeLEHR: Locator;
  private readonly rollenerweiterungBaumGruppeLERN: Locator;
  private readonly rollenerweiterungBaumGruppeLEIT: Locator;
  private readonly rollenerweiterungBaumGruppeCheckboxLEHR: Locator;
  private readonly rollenerweiterungBaumGruppeCheckboxLERN: Locator;
  private readonly rollenerweiterungBaumGruppeCheckboxLEIT: Locator;
  private readonly rollenerweiterungCancelButton: Locator;
  private readonly rollenerweiterungSaveButton: Locator;

  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.card = this.page.getByTestId('service-provider-details-by-schule-card');
    this.serviceProviderDetailsHeadline = this.page
      .getByTestId('layout-card-headline')
      .filter({ hasText: 'Angebot bearbeiten' });
    this.closeButton = this.page.getByTestId('close-layout-card-button');
    this.nameField = this.page.getByTestId('service-provider-name');
    this.administrationsebeneField = this.page.getByTestId('service-provider-administrationsebene');
    this.requires2faField = this.page.getByTestId('service-provider-requires-2fa');
    this.canBeAssignedToRollenField = this.page.getByTestId('service-provider-can-be-assigned-to-rollen');
    this.kategorieField = this.page.getByTestId('service-provider-kategorie');
    this.linkField = this.page.getByTestId('service-provider-link');
    this.rollenerweiterungField = this.page.getByTestId('service-provider-rollenerweiterung');
    this.rollenerweiterungenField = this.page.getByTestId('service-provider-rollenerweiterungen');
    this.rollenerweiterungenHeadline = this.page
      .getByTestId('layout-card-headline')
      .filter({ hasText: 'Rollenauswahl bearbeiten' });
    this.rollenerweiterungBearbeitenButton = this.page.getByTestId('rollenerweiterung-bearbeiten-button');
    this.rollenerweiterungBaumGruppeLEHR = this.page.getByTestId('treeview-group-LEHR');
    this.rollenerweiterungBaumGruppeLERN = this.page.getByTestId('treeview-group-LERN');
    this.rollenerweiterungBaumGruppeLEIT = this.page.getByTestId('treeview-group-LEIT');
    this.rollenerweiterungBaumGruppeCheckboxLEHR = this.page.getByTestId('treeview-group-checkbox-LEHR');
    this.rollenerweiterungBaumGruppeCheckboxLERN = this.page.getByTestId('treeview-group-checkbox-LERN');
    this.rollenerweiterungBaumGruppeCheckboxLEIT = this.page.getByTestId('treeview-group-checkbox-LEIT');
    this.rollenerweiterungCancelButton = this.page.getByTestId('rollenerweiterung-cancel-button');
    this.rollenerweiterungSaveButton = this.page.getByTestId('rollenerweiterung-save-button');
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<ServiceProviderDetailsBySchuleViewPage> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.card).toBeVisible();
    await expect(this.serviceProviderDetailsHeadline).toContainText('Angebot bearbeiten');
    // Die Detailfelder werden erst nach dem Laden des Angebots gerendert.
    await expect(this.page.getByTestId('service-provider-info-row')).toBeVisible();
    await expect(this.nameField).toBeVisible();
    return this;
  }

  public async getName(): Promise<string> {
    return this.nameField.innerText();
  }

  public async getAdministrationsebene(): Promise<string> {
    return this.administrationsebeneField.innerText();
  }

  public async getRequires2fa(): Promise<string> {
    return this.requires2faField.innerText();
  }

  public async getCanBeAssignedToRollen(): Promise<string> {
    return this.canBeAssignedToRollenField.innerText();
  }

  public async getKategorie(): Promise<string> {
    return this.kategorieField.innerText();
  }

  public async getLink(): Promise<string> {
    return this.linkField.innerText();
  }

  public async getRollenerweiterung(): Promise<string> {
    return this.rollenerweiterungField.innerText();
  }

  public async getRollenerweiterungen(): Promise<string> {
    return this.rollenerweiterungenField.innerText();
  }

  public async clickRollenerweiterungBearbeiten(): Promise<void> {
    await this.rollenerweiterungBearbeitenButton.click();
  }

  public async close(): Promise<void> {
    await this.closeButton.click();
  }

  /* assertions */
  public async assertPageIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.card).toBeVisible();
    await expect(this.serviceProviderDetailsHeadline).toContainText('Angebot bearbeiten');
  }

  public async assertServiceProviderDetailsHeadline(schulname: string): Promise<void> {
    await expect(this.serviceProviderDetailsHeadline).toHaveText(`Angebot bearbeiten ${schulname}`);
  }

  public async assertCanEditRollenerweiterung(): Promise<void> {
    await expect(this.rollenerweiterungBearbeitenButton).toBeVisible();
    await expect(this.rollenerweiterungBearbeitenButton).toBeEnabled();
  }

  public async assertServiceProviderDetails(expected: {
    organisation?: string;
    name?: string;
    administrationsebene?: string;
    requires2fa?: string;
    kategorie?: ServiceProviderKategorie;
    link?: string;
    rollenerweiterung?: string;
  }): Promise<void> {
    if (expected.name) await expect(this.nameField).toHaveText(expected.name);
    if (expected.organisation) await expect(this.administrationsebeneField).toHaveText(expected.organisation);
    if (expected.administrationsebene)
      await expect(this.administrationsebeneField).toHaveText(expected.administrationsebene);
    if (expected.requires2fa) await expect(this.requires2faField).toHaveText(expected.requires2fa);
    if (expected.kategorie) await expect(this.kategorieField).toHaveText(KATEGORIE_LABEL[expected.kategorie]);
    if (expected.link) await expect(this.linkField).toHaveText(expected.link);
    if (expected.rollenerweiterung) await expect(this.rollenerweiterungField).toHaveText(expected.rollenerweiterung);
  }

  public async assertRollenerweiterungenDetails(): Promise<void> {
    await expect(this.rollenerweiterungenHeadline).toHaveText('Rollenauswahl bearbeiten');
    await expect(this.rollenerweiterungBaumGruppeCheckboxLEHR).toBeVisible();
    await expect(this.rollenerweiterungBaumGruppeLEHR).toBeVisible();
    await expect(this.rollenerweiterungBaumGruppeCheckboxLERN).toBeVisible();
    await expect(this.rollenerweiterungBaumGruppeLERN).toBeVisible();
    await expect(this.rollenerweiterungBaumGruppeCheckboxLEIT).toBeVisible();
    await expect(this.rollenerweiterungBaumGruppeLEIT).toBeVisible();
    await expect(this.rollenerweiterungCancelButton).toBeVisible();
    await expect(this.rollenerweiterungCancelButton).toBeEnabled();
    await expect(this.rollenerweiterungSaveButton).toBeVisible();
    await expect(this.rollenerweiterungSaveButton).toBeEnabled();
  }

  public async assertRollenerweiterungen(expected: string): Promise<void> {
    await expect(this.rollenerweiterungenField).toHaveText(expected);
  }
}
