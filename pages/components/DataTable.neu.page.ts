import { expect, type Locator, Page } from '@playwright/test';

export class DataTable {
    /* since the table is within Vuetify's jurisdiction,
        we cannot specify test ids for Playwright and heavily rely on classes as locators */
    readonly tableLocator: Locator;

    constructor(protected readonly page: Page, locator: Locator) {
        this.tableLocator = locator;
    }

    /* actions */
    public getItemByText(expectedText: string): Locator {
      return this.tableLocator.getByRole('cell', { name: expectedText, exact: true });
    }

    public setItemsPerPage(value: string): void {
      const itemsPerPageSelect: Locator = this.page.locator('.v-data-table-footer__items-per-page .v-select');

      itemsPerPageSelect.selectOption(value);
    }

    public async goToFirstPage(): Promise<void> {
      const goToFirstPageButton: Locator = this.page.locator('.v-pagination__first button:not(.v-btn--disabled)');
      
      await goToFirstPageButton.click();
    }

    public async goToPreviousPage(): Promise<void> {
      const goToPreviousPageButton: Locator = this.page.locator('.v-pagination__prev button:not(.v-btn--disabled)');
      
      await goToPreviousPageButton.click();
    }

    public async goToNextPage(): Promise<void> {
      const goToNextPageButton: Locator = this.page.locator('.v-pagination__next button:not(.v-btn--disabled)');
      
      await goToNextPageButton.click();
    }

    public async goToLastPage(): Promise<void> {
      const goToLastPageButton: Locator = this.page.locator('.v-pagination__last button:not(.v-btn--disabled)');
      
      await goToLastPageButton.click();
    }

    /* assertions */
    public async checkCurrentPageNumber(expectedPageNumber: number): Promise<void> {
      const currentPageNumberElement: Locator = this.page.locator('.v-pagination__item');
      const currentPageNumberText: string | null = await currentPageNumberElement.textContent();

      await expect(currentPageNumberText).toEqual(expectedPageNumber);
    }

    public async checkHeaders(expectedHeaders: string[]): Promise<void> {
      const tableHeaders: Locator[] = await this.tableLocator.locator('thead th.v-data-table__th').all();
      const tableHeadersCount: number = tableHeaders.length;

      await expect(tableHeadersCount).toEqual(expectedHeaders.length);

      for (let i: number = 0; i < tableHeadersCount; i++) {
        const cell: Locator = tableHeaders[i].locator('.v-data-table-header__content').nth(i);

        await expect(cell).toBeVisible();
        await expect(cell).toHaveText(expectedHeaders[i]);
      }
    }

    public async checkRowCount(expectedRowCount: number): Promise<void> {
      const tableRows: Locator = this.tableLocator.locator('tbody tr.v-data-table__tr');
      const tableRowsCount: number = await tableRows.count();

      await expect(tableRowsCount).toEqual(expectedRowCount);
    }

    public async checkIfItemIsNotVisible(expectedText: string): Promise<void> {
      return expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeHidden();
    }

    public async checkIfItemIsVisible(expectedText: string): Promise<void> {
      return expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeVisible();
    }
}