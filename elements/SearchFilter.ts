import { type Locator, Page } from '@playwright/test';

export class SearchFilter {
  constructor(private readonly page: Page) {
      this.page = page;
    }
  
  public async searchByText(searchText: string): Promise<void> {
    const searchFilterInput: Locator = this.page.getByTestId('search-filter-input').locator('input');

    await searchFilterInput.fill(searchText);
    return this.page.getByTestId('apply-search-filter-button').click();
  }
}