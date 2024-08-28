import {Locator} from "@playwright/test";

export class ComboBox {
    constructor(private page, private locator: Locator) {
    }

    async select(schulstrukturknoten: string) {
        await this.locator.click();
        await this.page.getByText(schulstrukturknoten, { exact: true }).click();
    }
}