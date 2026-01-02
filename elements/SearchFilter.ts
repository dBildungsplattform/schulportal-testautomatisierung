import { type Locator, Page } from '@playwright/test';
import { waitForAPIResponse } from '../base/api/baseApi';

export class SearchFilter {
  constructor(private readonly page: Page, private readonly endpoint?: string) {}

  public async searchByText(searchText: string): Promise<void> {
    const searchFilterInput: Locator = this.page.getByTestId('search-filter-input').locator('input');

    await searchFilterInput.fill(searchText);
    await this.page.getByTestId('apply-search-filter-button').click();
    if (this.endpoint) {
      await waitForAPIResponse(this.page, this.endpoint);
    }
  }
}
