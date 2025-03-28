import { expect, type Locator, Page } from '@playwright/test';

const noDataMessage: string = 'Keine Daten gefunden.';
export class ComboBox {
  private readonly overlayLocator: Locator;
  private readonly itemsLocator: Locator;
  private readonly modalToggle: Locator;

  constructor(private readonly page: Page, private readonly locator: Locator) {
    this.overlayLocator = this.page.locator('div.v-overlay.v-menu');
    this.itemsLocator = this.page.locator('div.v-overlay.v-menu div.v-list-item');
    this.modalToggle = this.locator.locator('.v-field__append-inner');
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
  }

  public async toggleModal(): Promise<void> {
    await this.modalToggle.click();
  }

  public async searchByTitle(searchString: string, exactMatch: boolean): Promise<void> {
    await this.locator.click();
    await this.locator.fill(searchString);
    let item: Locator
    
    if (exactMatch) {
      item = this.itemsLocator.filter({
        // use regex to search for an exact match
        hasText: new RegExp(`^${searchString}$`), 
      })
    } else {
      // search for a string inside the item title
      item = this.itemsLocator.filter({
        has: this.page.getByText(searchString), 
      })
    }    
    await item.waitFor({ state: 'visible' });
    // This delay is needed for testcases who are using the method searchByTitle several times. It guarantees that the next combobox data is loaded correctly
    // TODO: we should improve the way we wait for items to be loaded when multiple comboboxes are clicked in sequence. we should maybe wait for another state or locator to ensure the dropdown menu is fully loaded
    await item.click({delay: 1000});
  }
}