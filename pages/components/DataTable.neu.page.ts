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

    public async setItemsPerPage(value: string): Promise<void> {
      await this.page.locator('.v-data-table-footer__items-per-page .v-field__append-inner').click();
      await expect(this.page.locator('.v-overlay')).toBeVisible();
      await expect(this.page.locator('.v-overlay').getByText(value, { exact: true })).toBeVisible();
      await this.page.locator('.v-overlay').getByText(value, { exact: true }).click({
        force: true
      });
      await expect(this.page.locator('.v-overlay')).toBeHidden();
    }

    public async goToFirstPage(): Promise<void> {
      await this.page.locator('.v-pagination__first button:not(.v-btn--disabled)').click();
    }

    public async goToPreviousPage(): Promise<void> {
      await this.page.locator('.v-pagination__prev button:not(.v-btn--disabled)').click();
    }

    public async goToNextPage(): Promise<void> {
      await this.page.locator('.v-pagination__next button:not(.v-btn--disabled)').click();
    }

    public async goToLastPage(): Promise<void> {
      await this.page.locator('.v-pagination__last button:not(.v-btn--disabled)').click();
    }

    /* assertions */
    public async checkCurrentPageNumber(expectedPageNumber: number): Promise<void> {
      const currentPageNumberElement: Locator = this.page.locator('.v-pagination__item');
      const currentPageNumberText: string | null = await currentPageNumberElement.textContent();

      await expect(Number(currentPageNumberText)).toBe(expectedPageNumber);
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
      await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeHidden();
    }

    public async checkIfItemIsVisible(expectedText: string): Promise<void> {
      await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeVisible();
    }
}