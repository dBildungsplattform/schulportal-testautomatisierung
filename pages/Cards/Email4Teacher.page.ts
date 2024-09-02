import { type Locator, Page } from "@playwright/test";

export class Email4TeacherPage {
  public readonly text_h1: Locator;

  public constructor(public readonly page: Page) {
    this.text_h1 = page
      .getByRole("heading", { name: "E-Mail", exact: true })
      .locator("span");
  }
}
