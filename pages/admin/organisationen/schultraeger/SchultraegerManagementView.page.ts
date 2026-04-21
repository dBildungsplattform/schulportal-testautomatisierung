import { expect, Page } from '@playwright/test';

export class SchultraegerManagementViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<SchultraegerManagementViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/schultraeger(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('schultraeger-table')).toBeVisible();
    return this;
  }
}
