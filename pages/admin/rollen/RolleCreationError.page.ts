import { expect, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { RolleCreationViewPage } from './RolleCreationView.neu.page';

export class RolleCreationErrorPage {
  private readonly rolleForm: RolleForm;

  constructor(protected readonly page: Page) {
    this.rolleForm = new RolleForm(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<RolleCreationErrorPage> {
    await expect(this.page.getByTestId('spsh-alert-title')).toHaveText();
    return this;
  }

  public async backToCreation(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('spsh-alert-button').click();
    return new RolleCreationViewPage(this.page).waitForPageLoad();
  }

  /* assertions */
  public async checkErrorPage(expectedText: string): Promise<void> {
    await expect(this.page.getByTestId('spsh-alert-text')).toContainText(expectedText);
    await expect(this.page.getByTestId('spsh-alert-button')).toBeVisible();
  }
}
