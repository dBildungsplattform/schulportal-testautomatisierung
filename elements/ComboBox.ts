import {Locator} from "@playwright/test";

export class ComboBox {
    constructor(private page, private locator: Locator) {
    }

    async select(value: string) {
        await this.locator.click();
        await this.page.getByText(value, { exact: true }).click();
    }
}