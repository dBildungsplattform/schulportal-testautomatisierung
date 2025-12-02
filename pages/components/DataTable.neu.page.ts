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
    await this.page.locator('.v-data-table-footer__items-per-page .v-select').click();
    await this.page.locator('.v-list-item').filter({ hasText: value }).click();
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

  public async checkTableData(landesadmin: boolean): Promise<void> {
    const tableRows: Locator = this.tableLocator.locator('tbody tr.v-data-table__tr');
    const tableRowsCount: number = await tableRows.count();
    for (let i: number = 0; i < tableRowsCount; i++) {
      await this.checkTableRow(i, landesadmin);
    }
  } 

  private async checkTableRow(i: number, landesadmin: boolean): Promise<void> {
    const tableRows: Locator = this.tableLocator.locator('tbody tr.v-data-table__tr');
    const klassennameCell: Locator = tableRows
      .nth(i)
      .locator('td')
      .nth(landesadmin ? 2 : 1);
    await expect(klassennameCell).toBeVisible();
    await expect(klassennameCell).not.toBeEmpty();

    if (!landesadmin) return;
    const dienststellennummerCell: Locator = tableRows.nth(i).locator('td').nth(1);
    await expect(dienststellennummerCell).toBeVisible();
    await expect(dienststellennummerCell).not.toHaveText('---');
    await expect(dienststellennummerCell).toHaveText(new RegExp(/\W+/));
  }

  public async checkIfItemIsNotVisible(expectedText: string): Promise<void> {
    await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeHidden();
  }

  public async checkIfItemIsVisible(expectedText: string): Promise<void> {
    await expect(this.tableLocator.getByRole('cell', { name: expectedText, exact: true })).toBeVisible();
  }
}