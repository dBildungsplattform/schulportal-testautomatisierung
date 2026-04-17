import { expect, Page } from '@playwright/test';

export class SchultraegerCreationViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<SchultraegerCreationViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/schultraeger\/new(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    return this;
  }
}
