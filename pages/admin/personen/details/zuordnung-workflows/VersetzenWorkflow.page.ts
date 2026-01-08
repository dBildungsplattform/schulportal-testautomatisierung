import { expect, type Locator, Page } from '@playwright/test';
import { BaseWorkflowPage } from './BaseWorkflow.page';
import { Autocomplete } from '../../../../../elements/Autocomplete';

export class VersetzenWorkflowPage extends BaseWorkflowPage {
  /* add global locators here */
  private readonly schule: Autocomplete;
  private readonly klasse: Autocomplete;
  protected readonly ENDPOINT: string = 'klasse-change/**';

  constructor(protected readonly page: Page) {
    super(page);
    this.schule = new Autocomplete(this.page, this.page.getByTestId('klasse-change-schule-select'));
    this.klasse = new Autocomplete(this.page, this.page.getByTestId('klasse-change-klasse-select'));
  }

  /* actions */
  public async selectSchule(schule: string): Promise<void> {
    await this.schule.searchByTitle(schule, false);
  }

  public async selectKlasse(klasse: string): Promise<void> {
    await this.klasse.searchByTitle(klasse, false);
  }

  /* assertions */
  public async checkSelectedSchule(schule: string): Promise<void> {
    await this.schule.checkText(schule);
  }

  public async checkSelectedKlasse(klasse: string): Promise<void> {
    await this.klasse.checkText(klasse);
  }

  public async checkConfirmation(from: string, to: string): Promise<void> {
    await expect(
      this.page.getByTestId('change-klasse-confirmation-dialog-text')
    ).toContainText(`Wollen Sie den Schüler aus Klasse ${from} in Klasse ${to} versetzen?`);
  }

  public async checkKlasseDropdownVisibleAndClickable(items: string[]): Promise<void> {
    await super.checkKlasseDropdownVisibleAndClickable(items);
  }

  /* template method implementations */
  protected async clickSubmitButton(): Promise<void> {
    const submitButton: Locator = this.page.getByTestId('klasse-change-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
  }

  protected async clickConfirmButton(): Promise<void> {
    const confirmButton: Locator = this.page.getByTestId('confirm-change-klasse-button');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
  }

  protected getDiscardButton(): Locator {
    return this.page.getByTestId('klasse-change-discard-button');
  }

  protected getCloseSuccessDialogButton(): Locator {
    return this.page.getByTestId('change-klasse-success-dialog-close-button');
  }

  protected getKlasseSelectTestId(): string {
    return 'klasse-change-klasse-select';
  }
}
