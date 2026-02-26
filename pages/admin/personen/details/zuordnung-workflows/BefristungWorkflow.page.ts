import { expect, type Locator, Page } from '@playwright/test';
import { BaseZuordnungWorkflowPage, TestIdsType } from './BaseWorkflow.page';

export class BefristungWorkflowPage extends BaseZuordnungWorkflowPage {
  /* add global locators here */
  private readonly unbefristetRadioButton: Locator;
  private readonly schuljahresendeRadioButton: Locator;
  protected readonly ENDPOINT: string = 'befristung-change/**';

  protected readonly TEST_IDS: TestIdsType = {
    submitButton: 'change-befristung-submit-button',
    confirmButton: 'confirm-change-befristung-button',
    discardButton: 'befristung-discard-button',
    closeSuccessDialog: 'change-befristung-success-dialog-close-button',
    klasseSelect: 'befristung-klasse-select',
  } as const;

  constructor(protected readonly page: Page) {
    super(page);
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
