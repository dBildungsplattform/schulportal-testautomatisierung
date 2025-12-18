import { expect, type Locator, Page } from '@playwright/test';

type ItemsPerPage = 5 | 30 | 50 | 100 | 300;

export class DataTable {
  /* since the table is within Vuetify's jurisdiction,
      we cannot specify test ids for Playwright and heavily rely on classes as locators */
  readonly tableLocator: Locator;
  readonly footer: Locator

  constructor(protected readonly page: Page, locator: Locator) {
      this.tableLocator = locator;
      this.footer = this.page.locator('.v-data-table-footer');
  }

  /* actions */

  public async waitForPageLoad(): Promise<void> {
    await expect(this.tableLocator).not.toContainText('Keine Daten');
  }

  public getItemByText(expectedText: string): Locator {
    return this.tableLocator.locator(`tr:has-text("${expectedText}")`);
  }

  public async clickColumnHeader(columnName: string): Promise<void> {
    const header: Locator = this.tableLocator.locator('th').filter({ hasText: columnName });
    await header.click();
    
    // Vuetify sortiert asynchron ohne Test-Hooks. Timeout notwendig, da Seitennummer nicht ändert
    // und keine anderen Mechanismen verfügbar sind, um auf Sortierungsvollendung zu warten
    await this.page.waitForTimeout(500);
    await this.waitForPageLoad();
  }

  public async setItemsPerPage(value: ItemsPerPage): Promise<void> {
    await this.footer.locator('.v-data-table-footer__items-per-page .v-field__append-inner').click();
    await this.page.locator('.v-list-item').getByText(value.toString(), { exact: true }).click();
    await expect(this.footer.locator('.v-select__selection-text')).toHaveText(value.toString());
    await expect(this.page.locator('.v-overlay__content.v-select__content')).toBeHidden();
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
    const tableHeadersCount: number = tableHeaders.length - 1; // frist th is for checkbox

    await expect(tableHeadersCount).toEqual(expectedHeaders.length);

    for (let i: number = 0; i < tableHeadersCount; i++) {
      const cell: Locator = tableHeaders[i+1].locator('.v-data-table-header__content');

      await expect(cell).toBeVisible();
      await expect(cell).toHaveText(expectedHeaders[i]);
    }
  }

  public async checkRowCount(expectedRowCount: number): Promise<void> {
    const tableRows: Locator = this.tableLocator.locator('tbody tr.v-data-table__tr');
    const tableRowsCount: number = await tableRows.count();

    await expect(tableRowsCount).toEqual(expectedRowCount);
  }

  public async checkTableData(table: Locator, checkTableRow: (i: number) => Promise<void>): Promise<void> {
    const tableRows: Locator = table.locator('tbody tr.v-data-table__tr');
    const tableRowsCount: number = await tableRows.count();
    for (let i: number = 0; i < tableRowsCount; i++) {
      await checkTableRow(i);
    }
  }

  public async checkIfItemIsNotVisible(expectedText: string): Promise<void> {
    await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeHidden();
  }

  public async checkIfItemIsVisible(expectedText: string): Promise<void> {
    await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeVisible();
  }

  public async checkColumnSorting(columnName: string, sortingStatus: 'ascending' | 'descending' | 'not-sortable'): Promise<void> {
    const header: Locator = this.tableLocator.locator('th').filter({ hasText: columnName });
    
    if (sortingStatus === 'ascending') {
      await expect(header.locator('.mdi-arrow-up')).toBeVisible();
    } else if (sortingStatus === 'descending') {
      await expect(header.locator('.mdi-arrow-down')).toBeVisible();
    } else if (sortingStatus === 'not-sortable') {
      await expect(header).not.toHaveClass(/v-data-table__th--sortable/);
    }
  }

  public async getTableColumnData(cellIndex: number): Promise<string[]> {
    const pageData: string[] = [];
    await this.waitForPageLoad();
    
    const tableRows: Locator = this.tableLocator.locator('tbody tr.v-data-table__tr');
    const rowCount: number = await tableRows.count();
    
    for (let i: number = 0; i < rowCount; i++) {
      const cell: Locator = tableRows.nth(i).locator('td').nth(cellIndex);
      const text: string | null = await cell.textContent();
      if (text) {
        pageData.push(text.trim());
      }
    }
    
    return pageData;
  }
}