import { expect, type Locator, Page } from '@playwright/test';

export class BefristungWorkflowPage {
  /* add global locators here */
  private readonly unbefristetRadioButton: Locator;
  private readonly schuljahresendeRadioButton: Locator;

  constructor(protected readonly page: Page) {
    this.unbefristetRadioButton = this.page.getByTestId('unbefristet-radio-button');
    this.schuljahresendeRadioButton = this.page.getByTestId('schuljahresende-radio-button');
  }

  /* actions */
  public async fillBefristungInput(befristung: string): Promise<void> {
    const befristungInput: Locator = this.page.getByTestId('befristung-input').locator('input');
    await befristungInput.waitFor({ state: 'visible' });
    await befristungInput.fill(befristung);
  }

  public async selectBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    await this.page.getByTestId(`${option}-radio-button`).locator('input').check();
  }

  public async submit(): Promise<void> {
    const submitButton: Locator = this.page.getByTestId('change-befristung-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
  }

  public async confirm(): Promise<void> {
    const confirmButton: Locator = this.page.getByTestId('confirm-change-befristung-button');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
  }

  public async closeSuccessDialog(): Promise<void> {
    const closeDialogButton: Locator = this.page.getByTestId('change-befristung-success-dialog-close-button');
    await closeDialogButton.waitFor({ state: 'visible' });
    await closeDialogButton.click();
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
    if (option === 'schuljahresende') await expect(this.schuljahresendeRadioButton).toBeChecked();
    if (option === 'unbefristet') await expect(this.unbefristetRadioButton).toBeChecked();
  }

  public async checkUnbefristetDisabled(): Promise<void> {
    await expect(this.unbefristetRadioButton).toBeDisabled();
  }
}
