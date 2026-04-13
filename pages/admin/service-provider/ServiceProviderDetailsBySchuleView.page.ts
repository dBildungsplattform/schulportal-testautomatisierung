import { expect, Locator, Page } from '@playwright/test';
import { MenuBarPage } from '../../components/MenuBar.neu.page';

export class ServiceProviderDetailsBySchuleViewPage {
  private readonly card: Locator;
  private readonly headline: Locator;
  private readonly closeButton: Locator;
  private readonly nameField: Locator;
  private readonly administrationsebeneField: Locator;
  private readonly requires2faField: Locator;
  private readonly canBeAssignedToRollenField: Locator;
  private readonly kategorieField: Locator;
  private readonly linkField: Locator;
  private readonly rollenerweiterungField: Locator;
  private readonly rollenerweiterungenField: Locator;
  private readonly rollenerweiterungBearbeitenButton: Locator;
  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.card = this.page.getByTestId('service-provider-details-by-schule-card');
    this.headline = this.page.getByTestId('layout-card-headline');
    this.closeButton = this.page.getByTestId('close-layout-card-button');
    this.nameField = this.page.getByTestId('service-provider-name');
    this.administrationsebeneField = this.page.getByTestId('service-provider-administrationsebene');
    this.requires2faField = this.page.getByTestId('service-provider-requires-2fa');
    this.canBeAssignedToRollenField = this.page.getByTestId('service-provider-can-be-assigned-to-rollen');
    this.kategorieField = this.page.getByTestId('service-provider-kategorie');
    this.linkField = this.page.getByTestId('service-provider-link');
    this.rollenerweiterungField = this.page.getByTestId('service-provider-rollenerweiterung');
    this.rollenerweiterungenField = this.page.getByTestId('service-provider-rollenerweiterungen');
    this.rollenerweiterungBearbeitenButton = this.page.getByTestId('rollenerweiterung-bearbeiten-button');
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<ServiceProviderDetailsBySchuleViewPage> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.card).toBeVisible();
    await expect(this.headline).toContainText('Angebot bearbeiten');
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
    await expect(this.headline).toContainText('Angebot bearbeiten');
  }

  public async assertHeadline(schulname: string): Promise<void> {
    await expect(this.headline).toHaveText(`Angebot bearbeiten ${schulname}`);
  }

  public async assertServiceProviderDetails(expected: {
    name?: string;
    administrationsebene?: string;
    requires2fa?: string;
    kategorie?: string;
    link?: string;
    rollenerweiterung?: string;
  }): Promise<void> {
    if (expected.name) await expect(this.nameField).toHaveText(expected.name);
    if (expected.administrationsebene) await expect(this.administrationsebeneField).toHaveText(expected.administrationsebene);
    if (expected.requires2fa) await expect(this.requires2faField).toHaveText(expected.requires2fa);
    if (expected.kategorie) await expect(this.kategorieField).toHaveText(expected.kategorie);
    if (expected.link) await expect(this.linkField).toHaveText(expected.link);
    if (expected.rollenerweiterung) await expect(this.rollenerweiterungField).toHaveText(expected.rollenerweiterung);
  }

  public async assertRollenerweiterungen(expected: string): Promise<void> {
    await expect(this.rollenerweiterungenField).toHaveText(expected);
  }
}
