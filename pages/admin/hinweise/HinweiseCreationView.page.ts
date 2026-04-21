import { expect, Page } from '@playwright/test';

export class HinweiseCreationViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<HinweiseCreationViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/hinweise\/new(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('newsbox-text')).toBeVisible();
    await expect(this.page.getByTestId('submit-newsbox')).toBeVisible();
    return this;
  }
}
