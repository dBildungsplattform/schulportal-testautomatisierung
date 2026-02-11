import { expect, type Locator, Page } from '@playwright/test';
import { ZuordnungenPage } from '../Zuordnungen.page';
import { waitForAPIResponse } from '../../../../../base/api/baseApi';

export interface TestIdsType {
  submitButton: string;
  confirmButton: string;
  discardButton: string;
  closeSuccessDialog: string;
  klasseSelect: string;
}

export abstract class BaseWorkflowPage {
  protected abstract readonly ENDPOINT: string;
  protected abstract readonly TEST_IDS: TestIdsType;

  constructor(protected readonly page: Page) {}

  /* actions */
  protected getSubmitButtonTestId(): string {
    return this.TEST_IDS.submitButton;
  }

  protected getConfirmButtonTestId(): string {
    return this.TEST_IDS.confirmButton;
  }

  protected getDiscardButtonTestId(): string {
    return this.TEST_IDS.discardButton;
  }

  protected getCloseSuccessDialogButtonTestId(): string {
    return this.TEST_IDS.closeSuccessDialog;
  }

  protected getKlasseSelectTestId(): string {
    return this.TEST_IDS.klasseSelect;
  }

  protected async waitForResponse(): Promise<void> {
    await waitForAPIResponse(this.page, this.ENDPOINT);
  }

  public async submit(): Promise<ZuordnungenPage> {
    const submitButton: Locator = this.page.getByTestId(this.getSubmitButtonTestId());
    await submitButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async confirm(): Promise<ZuordnungenPage> {
    const confirmButton: Locator = this.page.getByTestId(this.getConfirmButtonTestId());
    await confirmButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async discard(): Promise<ZuordnungenPage> {
    const discardButton: Locator = this.page.getByTestId(this.getDiscardButtonTestId());
    await discardButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async closeSuccessDialog(): Promise<void> {
    const closeDialogButton: Locator = this.page.getByTestId(this.getCloseSuccessDialogButtonTestId());
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
}
