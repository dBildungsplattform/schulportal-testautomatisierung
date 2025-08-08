import { expect, type Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';

interface SchuleCreationParams {
  name: string;
  dienststellenNr: string;
  schulform: 'öffentlich';
}

export class SchuleCreationViewPage extends AbstractAdminPage {
  private readonly headline: Locator = this.page.getByTestId('layout-card-headline');
  private readonly oeffentlicheSchuleOption: Locator = this.page.getByTestId('schulform-radio-button-0');
  private selectedSchultraegerName: string;

  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('schule-creation-card').waitFor({ state: 'visible' });
    await expect(this.headline).toHaveText('Neue Schule hinzufügen');
  }

  public async createSchule(params: SchuleCreationParams): Promise<void> {
    if (params.schulform === 'öffentlich') {
      await this.oeffentlicheSchuleOption.click();
      this.selectedSchultraegerName = await this.oeffentlicheSchuleOption.innerText();
    }

    await this.page.getByTestId('dienststellennummer-input').locator('input').fill(params.dienststellenNr);
    await this.page.getByTestId('schulname-input').locator('input').fill(params.name);
    await this.page.getByTestId('schule-creation-form-submit-button').click();
  }

  public async createAnother(): Promise<void> {
    await this.page.getByTestId('create-another-schule-button').click();
  }

  /* assertions */
  public async checkSuccessPage(params: Omit<SchuleCreationParams, 'schulform'>): Promise<void> {
    await expect(this.page.getByTestId('schule-success-text')).toBeVisible();
    await expect(this.headline).toHaveText('Neue Schule hinzufügen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByTestId('schule-success-text')).toBeVisible();
    await expect(this.page.locator('.mdi-check-circle')).toBeVisible();
    await expect(this.page.getByText('Folgende Daten wurden gespeichert:')).toBeVisible();
    await expect(this.page.getByText('Schulform:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-schule-form')).toContainText(this.selectedSchultraegerName);
    await expect(this.page.getByText('Dienststellennummer:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-schule-dienststellennummer')).toHaveText(params.dienststellenNr);
    await expect(this.page.getByText('Schulname:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-schule-name')).toHaveText(params.name);
    await expect(this.page.getByTestId('create-another-schule-button')).toBeVisible();
    await expect(this.page.getByTestId('back-to-list-button')).toBeVisible();
  }
}
