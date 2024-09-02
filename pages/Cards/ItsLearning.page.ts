import { type Locator, Page } from "@playwright/test";

export class ItsLearningPage {
  public readonly text_h1: Locator;

  public constructor(public page: Page) {
    this.text_h1 = page.getByRole("heading", {
      name: "Staging Umgebung Schleswig-Holstein",
    });
  }
}
