import { expect, type Locator, Page } from '@playwright/test';
import { ZuordnungenPage } from '../Zuordnungen.page';
import { waitForAPIResponse } from '../../../../../base/api/baseApi';

export abstract class BaseWorkflowPage {
  protected abstract readonly ENDPOINT: string;

  constructor(protected readonly page: Page) {}

  /* actions */
  protected async waitForResponse(): Promise<void> {
    await waitForAPIResponse(this.page, this.ENDPOINT);
  }

  public async submit(): Promise<ZuordnungenPage> {
    await this.clickSubmitButton();
    await this.waitForResponse();
    return new ZuordnungenPage(this.page);
  }

  public async confirm(): Promise<ZuordnungenPage> {
    await this.clickConfirmButton();
    await this.waitForResponse();
    return new ZuordnungenPage(this.page);
  }

  public async discard(): Promise<ZuordnungenPage> {
    await this.getDiscardButton().click();
    return new ZuordnungenPage(this.page);
  }

  public async closeSuccessDialog(): Promise<void> {
    const closeDialogButton: Locator = this.getCloseSuccessDialogButton();
    await closeDialogButton.waitFor({ state: 'visible' });
    await closeDialogButton.click();
  }

  /* assertions */
  public async checkKlasseDropdownVisibleAndClickable(items: string[]): Promise<void> {
    const sortedItems: string[] = [...items].sort((a: string, b: string) => a.localeCompare(b, 'de', { numeric: true }));
    for (const item of sortedItems) {
      await this.page.getByTestId(this.getKlasseSelectTestId()).click();
      const option: Locator = this.page.getByRole('option', { name: item, exact: false });
      await option.scrollIntoViewIfNeeded();
      await expect(option).toBeVisible();
      await option.click();
    }
  }

  /* template methods - subclasses override these */
  protected abstract clickSubmitButton(): Promise<void>;
  protected abstract clickConfirmButton(): Promise<void>;
  protected abstract getDiscardButton(): Locator;
  protected abstract getCloseSuccessDialogButton(): Locator;
  protected abstract getKlasseSelectTestId(): string;
}
