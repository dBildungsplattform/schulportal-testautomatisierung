import { expect, Locator, Page } from '@playwright/test';

export class SuchergebnisPopup {
  constructor(protected readonly page: Page, private readonly locator: Locator) {}

  readonly headline: Locator = this.locator.getByTestId('layout-card-headline');
  readonly noPersonFoundText: Locator = this.locator.getByTestId('no-person-found-text');
  readonly abbrechenButton: Locator = this.locator.getByTestId('cancel-person-search-error-button');

  /* actions */

  /* assertions */
  public async checkPopupCompleteness(): Promise<void> {
    await expect(this.headline).toHaveText('Suchergebnis');
    await expect(this.noPersonFoundText).toBeVisible();
    await expect(this.abbrechenButton).toBeVisible();
  }
}