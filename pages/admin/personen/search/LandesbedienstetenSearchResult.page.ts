import { expect, Locator, Page } from "@playwright/test";
import { LandesbedienstetenSearchFormPage } from "./LandesbedienstetenSearchForm.page";
import { LandesbedienstetenHinzufuegenPage } from "./LandesbedienstetenHinzufuegen.page";

export class LandesbedienstetenSearchResultPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  private readonly headline: Locator = this.page.getByTestId('layout-card-headline-search-result');
  // Persönliche Daten
 // private readonly personalDataCard: Locator = this.page.getByTestId('personal-data-card').nth(1);
  private readonly personalDataHeadline: Locator = this.page.getByTestId('layout-card-headline-personal-data');
  private readonly pCardFullname: Locator = this.page.getByTestId('fullname-value');
  private readonly pCardUsername: Locator = this.page.getByTestId('username-value');
  private readonly pCardKopersnummer: Locator = this.page.getByTestId('kopersnummer-value');
  private readonly pCardEmail: Locator = this.page.getByTestId('person-email-value');

  // Schulzuordnung
  //private readonly zuordnungCard: Locator = this.page.getByTestId('zuordnung-card-1');
  private readonly zuordnungHeadline: Locator = this.page.getByTestId('zuordnung-card-1-headline');
  private readonly zCardOrganisation: Locator = this.page.getByTestId('organisation-value-1');
  private readonly zCardRolle: Locator = this.page.getByTestId('rolle-value-1');
  private readonly zCardDienststellennummer: Locator = this.page.getByTestId('dienststellennummer-value-1');
  // Buttons
  private readonly zurueckZurSucheButton: Locator = this.page.getByTestId('back-to-search-button');
  private readonly landesbedienstetenHinzufuegenButton: Locator = this.page.getByTestId('add-state-employee-button');

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.headline).toHaveText('Suchergebnis');
  }
  public async checkSearchResultCard(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.landesbedienstetenHinzufuegenButton).toBeVisible();
    await expect(this.zurueckZurSucheButton).toBeVisible();
  }

  public async checkPersonalDataCard(
    fullName: string, username: string, kopersnummer: string, email?: string
  ): Promise<void> {
    await expect(this.personalDataHeadline).toHaveText('Persönliche Daten');
    await expect(this.pCardFullname).toHaveText(fullName);
    await expect(this.pCardUsername).toHaveText(username);
    await expect(this.pCardKopersnummer).toHaveText(kopersnummer);
    if (email !== undefined) {
      if (await this.pCardEmail.isVisible()) {
        await expect(this.pCardEmail).toHaveText(email);
      }
    }
  }

  public async checkZuordnungCard(organisation: string, rolle: string, dienststellennummer: string): Promise<void> {
    await expect(this.zuordnungHeadline).toHaveText('Schulzuordnung');
    await expect(this.zCardOrganisation).toHaveText(organisation);
    await expect(this.zCardRolle).toHaveText(rolle);
    await expect(this.zCardDienststellennummer).toHaveText(dienststellennummer);
  }

  public async clickZurueckZurSuche(): Promise<LandesbedienstetenSearchFormPage> {
    await this.zurueckZurSucheButton.click();
    const landesbedienstetenSearchFormPage: LandesbedienstetenSearchFormPage = new LandesbedienstetenSearchFormPage(this.page);
    await landesbedienstetenSearchFormPage.waitForPageLoad();
    await expect(this.headline).toBeHidden();
    return landesbedienstetenSearchFormPage;
  }

  public async clickLandesbedienstetenHinzufuegen(): Promise<LandesbedienstetenHinzufuegenPage> {
    await this.landesbedienstetenHinzufuegenButton.click();
    const landesbedienstetenHinzufuegenPage: LandesbedienstetenHinzufuegenPage = new LandesbedienstetenHinzufuegenPage(this.page);
    await landesbedienstetenHinzufuegenPage.waitForPageLoad();
    await expect(this.headline).toBeHidden();
    return landesbedienstetenHinzufuegenPage;
  }
}