import { expect, Locator, Page } from '@playwright/test';

export class PersonSearchErrorPopup {
  constructor(private readonly page: Page) {}
  public popup: Locator = this.page.getByTestId('person-search-error-dialog');

  // Überschrift
  public headline: Locator = this.popup.getByTestId('layout-card-headline');

  // Infotext
  public noPersonFoundText: Locator = this.popup.getByTestId('no-person-found-text');

  // Abbrechen-Button
  public cancelButton: Locator = this.popup.getByTestId('cancel-person-search-error-button');

  // Aktionen
  // Prüfen, dass alles auf dem Popup sichtbar ist
  public async checkPopupCompleteness(): Promise<void> {
    await expect(this.headline).toHaveText('Suchergebnis');
    await expect(this.noPersonFoundText).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

//   async clickCancel() {
//     await this.cancelButton.click();
//   }

//   async isVisible() {
//     return await this.headline.isVisible();
//   }
}