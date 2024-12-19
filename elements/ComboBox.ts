import { type Locator, Page } from "@playwright/test";

export class ComboBox {
  constructor(
    private readonly page: Page,
    private readonly locator: Locator,
  ) {}

  private readonly itemsLocator = this.page.locator(
    "div.v-overlay.v-menu div.v-list-item",
  );

  public async selectByPosition(selection: number[]): Promise<string[]> {
    const selectedItems: string[] = [];
    await this.locator.click();
    const items = this.itemsLocator;
    for (const index of selection) {
      const item = items.nth(index);
      selectedItems.push(await item.locator(".v-list-item-title").innerText());
      await item.click();
    }
    return selectedItems;
  }

  public async selectByTitle(title: string): Promise<void> {
    await this.locator.click();
    const item = this.itemsLocator.filter({
      has: this.page.getByText(title, { exact: true }),
    });
    await item.waitFor({ state: "visible" });
    await item.click();
  }

  public async searchByTitle(title: string): Promise<void> {
    await this.locator.click();
    await this.locator.fill(title);
    const item = this.itemsLocator.filter({
      has: this.page.getByText(title, { exact: true }),
    });
    await item.waitFor({ state: "visible" });
    await item.click();
  }
}
