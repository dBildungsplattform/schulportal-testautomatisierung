import { Locator, Page } from "@playwright/test";

export class ComboBox {
  public constructor(
    private page: Page,
    private locator: Locator,
  ) {}

  public async select(value: string): Promise<void> {
    await this.locator.click();
    await this.page.getByText(value, { exact: true }).click();
  }
}
