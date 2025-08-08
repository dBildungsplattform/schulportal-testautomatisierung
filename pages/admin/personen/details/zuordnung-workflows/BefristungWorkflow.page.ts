import { expect, type Locator, Page } from '@playwright/test';

export class BefristungWorkflowPage {
  /* locators */
  readonly page: Page;
  private readonly unbefristetRadioButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.unbefristetRadioButton = this.page.getByTestId('unbefristet-radio-button');
  }

  /* actions */
  public async fill(befristung: string): Promise<void> {
    this.page.locator('[data-testid="befristung-input"] input').fill(befristung);
  }

  public async selectBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    if (option === 'schuljahresende') {
      await this.page.getByTestId('schuljahresende-radio-button').locator('input').check();
    } else if (option === 'unbefristet') {
      await this.page.getByTestId('unbefristet-radio-button').locator('input').check();
    }
  }

  public async submit(): Promise<void> {
    await this.page.getByTestId('change-befristung-submit-button').click();
  }

  public async confirm(): Promise<void> {
    await this.page.getByTestId('confirm-change-befristung-button').click();
  }

  public async closeSuccessDialog(): Promise<void> {
    await this.page.getByTestId('change-befristung-success-close').click();
  }

  /* assertions */
  public async checkError(shouldBeVisible: boolean): Promise<void> {
    const locator: Locator = this.page.getByText('Das eingegebene Datum darf nicht in der Vergangenheit liegen.');
    if (shouldBeVisible) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).toBeHidden();
    }
  }

  public async checkConfirmation(oldValue: string, newValue: string): Promise<void> {
    await expect(
      this.page.getByText(`Möchten Sie die Befristung wirklich von ${oldValue} in ${newValue} ändern?`)
    ).toBeVisible();
  }

  public async checkSelectedBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    if (option === 'schuljahresende') await expect(this.page.getByTestId('schuljahresende-radio-button')).toBeChecked();
    if (option === 'unbefristet') await expect(this.unbefristetRadioButton).toBeChecked();
  }

  public async checkUnbefristetDisabled(): Promise<void> {
    await expect(this.unbefristetRadioButton).toBeDisabled();
  }
}
