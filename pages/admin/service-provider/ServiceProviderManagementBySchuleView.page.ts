import { expect, Page } from '@playwright/test';

export class ServiceProviderManagementBySchuleViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<ServiceProviderManagementBySchuleViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/angebote\/schulspezifisch(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('reset-filter-button')).toBeVisible();
    return this;
  }
}
