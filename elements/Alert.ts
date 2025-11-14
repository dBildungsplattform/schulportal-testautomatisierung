import { expect, Locator, Page } from '@playwright/test';

type Keys = 'title' | 'text' | 'button';
type ExpectedTexts = Record<Keys, string>;
type TestIds = Record<Keys, string>;
type Locators = Record<Keys, Locator>;

export class Alert<T> {
  private readonly locators: Locators;

  constructor(
    private readonly page: Page,
    private readonly expectedTexts: ExpectedTexts,
    private readonly nextPage: T,
    locatorTestIds: TestIds = {
      title: 'spsh-alert-title',
      text: 'spsh-alert-text',
      button: 'spsh-alert-button',
    }
  ) {
    this.locators = {
      title: this.page.getByTestId(locatorTestIds.title),
      text: this.page.getByTestId(locatorTestIds.text),
      button: this.page.getByTestId(locatorTestIds.button),
    };
  }

  async confirm(): Promise<T> {
    await this.locators.button.click();
    return this.nextPage;
  }

  async assertExpectedTexts(): Promise<void> {
    await Promise.all(
      Object.entries(this.expectedTexts).map(([key, expectedText]: [Keys, string]) =>
        expect(this.locators[key]).toHaveText(expectedText)
      )
    );
  }
}
