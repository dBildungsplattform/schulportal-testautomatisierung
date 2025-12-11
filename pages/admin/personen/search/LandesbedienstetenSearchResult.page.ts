import { expect, Locator, Page } from "@playwright/test";
import { LandesbedienstetenSearchFormPage } from "./LandesbedienstetenSearchForm.page";
import { LandesbedienstetenHinzufuegenPage } from "./LandesbedienstetenHinzufuegen.page";

export class LandesbedienstetenSearchResultPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  private readonly headline: Locator = this.page.getByTestId('layout-card-headline-search-result');
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
    const pCardEmail: Locator = this.page.getByTestId('person-email-value');
    await expect(this.page.getByTestId('layout-card-headline-personal-data')).toHaveText('Persönliche Daten');
    await expect(this.page.getByTestId('fullname-value')).toHaveText(fullName);
    await expect(this.page.getByTestId('username-value')).toHaveText(username);
    await expect(this.page.getByTestId('kopersnummer-value')).toHaveText(kopersnummer);
    if (email !== undefined) {
      if (await pCardEmail.isVisible()) {
        await expect(pCardEmail).toHaveText(email);
      }
    }
  }

  public async checkZuordnungCard(organisation: string, rolle: string, dienststellennummer: string): Promise<void> {
    await expect(this.page.getByTestId('zuordnung-card-1-headline')).toHaveText('Schulzuordnung');
    await expect(this.page.getByTestId('organisation-value-1')).toHaveText(organisation);
    await expect(this.page.getByTestId('rolle-value-1')).toHaveText(rolle);
    await expect(this.page.getByTestId('dienststellennummer-value-1')).toHaveText(dienststellennummer);
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