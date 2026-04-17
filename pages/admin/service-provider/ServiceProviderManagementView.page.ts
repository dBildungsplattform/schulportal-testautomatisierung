import { expect, Page } from '@playwright/test';

export class ServiceProviderManagementViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<ServiceProviderManagementViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/angebote(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    return this;
  }
}
