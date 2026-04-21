import { expect, Page } from '@playwright/test';

export class ServiceProviderCreationViewPage {
  constructor(protected readonly page: Page) {}

  public async waitForPageLoad(): Promise<ServiceProviderCreationViewPage> {
    await expect(this.page).toHaveURL(/\/admin\/angebote\/new(?:\?.*)?$/);
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.page.getByTestId('name-input')).toBeVisible();
    return this;
  }
}
