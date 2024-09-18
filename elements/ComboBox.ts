import { type Locator, Page } from "@playwright/test";

export class ComboBox {
    constructor(private readonly page: Page, private readonly locator: Locator) {}

    public async selectByPosition(selection: number[]): Promise<string[]> {
        const selectedItems: string[] = [];
        await this.locator.click();
        const items = this.page.locator("div.v-overlay.v-menu div.v-list-item");
        for (const index of selection) {
            const item = items.nth(index);
            selectedItems.push(await item.locator(".v-list-item-title").innerText());
            await item.click();
        }
        return selectedItems;
    }
}