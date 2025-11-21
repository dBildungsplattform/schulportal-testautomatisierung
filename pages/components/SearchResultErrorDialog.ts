import { expect, Locator, Page } from '@playwright/test';
import { LandesbedienstetenSearchFormPage } from '../admin/personen/search/LandesbedienstetenSearchForm.page';

export class SearchResultErrorDialog {
  constructor(protected readonly page: Page, private readonly locator: Locator, private readonly errorMessage: string) {}

  private readonly headline: Locator = this.locator.getByTestId('layout-card-headline');
  private readonly noPersonFoundText: Locator = this.locator.getByTestId('no-person-found-text');
  private readonly abbrechenButton: Locator = this.locator.getByTestId('cancel-person-search-error-button');
  
  /* actions */
  public async clickAbbrechenButton(): Promise<LandesbedienstetenSearchFormPage> {
    await this.abbrechenButton.click();
    await expect(this.headline).toBeHidden();
    return new LandesbedienstetenSearchFormPage(this.page);
  }
  /* assertions */
  public async checkPopupCompleteness(): Promise<void> {
    await expect(this.headline).toHaveText('Suchergebnis');
    await expect(this.noPersonFoundText).toBeVisible();
    await expect(this.abbrechenButton).toBeVisible();
    await expect(this.noPersonFoundText).toHaveText(this.errorMessage);
    await expect(this.abbrechenButton).toHaveText('Abbrechen');
  }
}