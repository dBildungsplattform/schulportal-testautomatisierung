import { expect, type Locator, Page } from '@playwright/test';
import { waitForAPIResponse } from '../base/api/testHelper.page';

const noDataMessage: string = 'Keine Daten gefunden.';
export class Autocomplete {
  private readonly overlayLocator: Locator;
  private readonly itemsLocator: Locator;
  private readonly modalToggle: Locator;
  private readonly inputLocator: Locator;
  private readonly loadingLocator: Locator;

  constructor(private readonly page: Page, private readonly locator: Locator) {
    this.overlayLocator = this.page.locator('div.v-overlay.v-menu');
    this.itemsLocator = this.page.locator('div.v-overlay.v-menu div.v-list-item');
    this.modalToggle = this.locator.locator('.v-field__append-inner');
    this.inputLocator = this.locator.locator('input');
    this.loadingLocator = this.locator.locator('.v-field__loader');
  }

  private async waitForData(): Promise<void> {
    await expect(this.overlayLocator).not.toHaveText(noDataMessage);
  }

  public async selectByPosition(selection: number[]): Promise<string[]> {
    const selectedItems: string[] = [];
    await this.openModal();
    await this.waitForData();
    const items: Locator = this.itemsLocator;
    for (const index of selection) {
      const item: Locator = items.nth(index);
      selectedItems.push(await item.locator('.v-list-item-title').innerText());
      await item.click();
    }
    await this.closeModal();
    return selectedItems;
  }

  public async selectByTitle(title: string): Promise<void> {
    await this.openModal();
    await this.waitForData();
    const item: Locator = this.itemsLocator.filter({
      has: this.page.getByText(title, { exact: true }),
    });
    await item.waitFor({ state: 'visible' });
    await item.click();
    await this.closeModal();
    await item.waitFor({ state: 'hidden' });
  }

  public async openModal(): Promise<void> {
    await this.modalToggle.click();
  }

  public async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.getByTestId('admin-headline').click();
  }

  public async toggleModal(): Promise<void> {
    await this.modalToggle.click();
  }

  public async clear(): Promise<void> {
    await this.inputLocator.clear();
  }

  // only works on comboboxes, where loading is set properly
  public async waitUntilLoadingIsDone(): Promise<void> {
    await expect(this.loadingLocator.getByRole('progressbar')).toBeHidden();
  }

  public async searchByTitle(searchString: string, exactMatch: boolean, endpoint?: string): Promise<void> {
    const currentValue: string | null = await this.inputLocator.textContent();
    if (currentValue === searchString) {
      return;
    }
    await this.openModal();
    await this.clear();
    await this.inputLocator.pressSequentially(searchString);
    let item: Locator;

    if (exactMatch) {
      item = this.itemsLocator.filter({
        hasText: new RegExp(`^${searchString}$`),
      });
    } else {
      item = this.itemsLocator.filter({
        has: this.page.getByText(searchString),
      });
    }

    // When creating a Landesadministrator, after selecting a Land as an organisation, we must wait for the personenkontext workflow endpoint to return rollen,
    // because in that case the API call takes longer than in other cases.
    // This only occurs in the test case 'Einen Benutzer mit der Rolle Landesadmin anlegen' (Person.spec.ts),
    // in all other test cases we don't need the parameter 'endpoint'
    if (endpoint) {
      await waitForAPIResponse(this.page, endpoint);
    }
    await item.click();
    await this.closeModal();
  }

  public async validateItemNotExists(searchString: string, exactMatch: boolean): Promise<void> {
    await this.inputLocator.click();
    await this.inputLocator.fill(searchString);
    let item: Locator;

    if (exactMatch) {
      item = this.itemsLocator.filter({
        // use regex to search for an exact match
        hasText: new RegExp(`^${searchString}$`),
      });
    } else {
      // search for a string inside the item title
      item = this.itemsLocator.filter({
        has: this.page.getByText(searchString),
      });
    }

    await expect(item).toBeHidden();
  }

  public async validateItemExists(searchString: string, exactMatch: boolean): Promise<void> {
    await this.inputLocator.click();
    await this.inputLocator.fill(searchString);
    let item: Locator;

    if (exactMatch) {
      item = this.itemsLocator.filter({
        // use regex to search for an exact match
        hasText: new RegExp(`^${searchString}$`),
      });
    } else {
      // search for a string inside the item title
      item = this.itemsLocator.filter({
        has: this.page.getByText(searchString),
      });
    }

    await expect(item).toBeVisible();
  }

  public async checkText(text: string): Promise<void> {
    await expect(this.locator).toHaveText(text);
  }
}
