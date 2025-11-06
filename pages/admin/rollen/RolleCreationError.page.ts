import { expect, Page } from '@playwright/test';
import { RolleForm } from '../../../components/RolleForm';
import { RolleCreationParams, RolleCreationViewPage } from './RolleCreationView.neu.page';
import { RolleManagementViewPage } from './RolleManagementView.neu.page';

export class RolleCreationErrorPage {
  private readonly rolleForm: RolleForm;

  constructor(protected readonly page: Page) {
    this.rolleForm = new RolleForm(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Neue Rolle hinzufügen');
    await expect(this.page.getByTestId('spsh-alert-title')).toHaveText('Fehler beim Anlegen der Rolle');
  }

  public async backToCreation(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('spsh-alert-button').click();
    const rolleCreationViewPage: RolleCreationViewPage = new RolleCreationViewPage(this.page);
    await rolleCreationViewPage.waitForPageLoad();
    return rolleCreationViewPage;
  }

  /* assertions */
  public async checkErrorPage(expectedText: string): Promise<void> {
    await expect(this.page.getByTestId('spsh-alert-text')).toContainText(expectedText);
    await expect(this.page.getByTestId('spsh-alert-button')).toBeVisible();
  }
}
