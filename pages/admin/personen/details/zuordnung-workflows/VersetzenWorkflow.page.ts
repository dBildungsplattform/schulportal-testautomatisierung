import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../../../elements/Autocomplete';
import { ZuordnungenPage } from '../Zuordnungen.page';

export class VersetzenWorkflowPage {
  /* add global locators here */
  private readonly schule: Autocomplete;
  private readonly klasse: Autocomplete;

  constructor(protected readonly page: Page) {
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

  public async submit(): Promise<ZuordnungenPage> {
    const submitButton: Locator = this.page.getByTestId('klasse-change-submit-button');
    await submitButton.waitFor({ state: 'visible' });
    await submitButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async confirm(): Promise<ZuordnungenPage> {
    const confirmButton: Locator = this.page.getByTestId('confirm-change-klasse-button');
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async discard(): Promise<ZuordnungenPage> {
    const discardButton: Locator = this.page.getByTestId('klasse-change-discard-button');
    await discardButton.click();
    return new ZuordnungenPage(this.page);
  }

  public async closeSuccessDialog(): Promise<void> {
    const closeDialogButton: Locator = this.page.getByTestId('change-klasse-success-dialog-close-button');
    await closeDialogButton.waitFor({ state: 'visible' });
    await closeDialogButton.click();
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
    const sortedItems: string[] = [...items].sort((a: string, b: string) => a.localeCompare(b, 'de', { numeric: true }));
    for (const item of sortedItems) {
      await this.page.getByTestId('klasse-change-klasse-select').click();
      const option: Locator = this.page.getByRole('option', { name: item, exact: false });
      await option.scrollIntoViewIfNeeded();
      await expect(option).toBeVisible();
      await option.click();
    }
  }
}
