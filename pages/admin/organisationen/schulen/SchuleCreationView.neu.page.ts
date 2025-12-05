import { expect, type Locator, Page } from '@playwright/test';
import { SchuleCreationSuccessPage } from './SchuleCreationSuccess.page';

enum Schulform {
  Oeffentlich = 'öffentlich',
  Ersatz = 'ersatz'
}

export interface SchuleCreationParams {
  name: string;
  dienststellenNr: string;
  schulform: Schulform;
}

export class SchuleCreationViewPage {
  private readonly headline: Locator = this.page.getByTestId('schule-creation-headline');
  private readonly oeffentlicheSchuleOption: Locator = this.page.getByTestId('schulform-radio-button-0');
  private selectedSchultraegerName: string;

  constructor(protected readonly page: Page) {}

  /* actions */
  public async waitForPageLoad(): Promise<SchuleCreationViewPage> {
    await this.headline.waitFor({ state: 'visible' });
    await expect(this.headline).toHaveText('Neue Schule hinzufügen');
    return this;
  }

  public async createSchule(params: SchuleCreationParams): Promise<SchuleCreationSuccessPage> {
    const dienststellenNrInput: Locator = this.page.getByTestId('dienststellennummer-input').locator('input');
    const schuleNameInput: Locator = this.page.getByTestId('schulname-input').locator('input');
    const createSchuleButton: Locator = this.page.getByTestId('schule-creation-form-submit-button');

    if (params.schulform === Schulform.Oeffentlich) {
      await this.oeffentlicheSchuleOption.click();
      this.selectedSchultraegerName = await this.oeffentlicheSchuleOption.innerText();
    }

    await dienststellenNrInput.waitFor({ state: 'visible' });
    await dienststellenNrInput.fill(params.dienststellenNr);

    await schuleNameInput.waitFor({ state: 'visible' });
    await schuleNameInput.fill(params.name);

    await createSchuleButton.waitFor({ state: 'visible' });
    await createSchuleButton.click();

    return new SchuleCreationSuccessPage(this.page);
  }

  public async createAnother(): Promise<void> {
    await this.page.getByTestId('create-another-schule-button').click();
  }

  /* assertions */
  public async checkSuccessPage(
    params: SchuleCreationParams
  ): Promise<void> {
    /* header */
    await expect(this.headline).toHaveText('Neue Schule hinzufügen');
    await expect(this.page.getByTestId('schule-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('schule-success-text')).toBeVisible();

    /* buttons */
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByTestId('create-another-schule-button')).toBeVisible();
    await expect(this.page.getByTestId('back-to-list-button')).toBeVisible();

    /* key column */
    await expect(this.page.getByTestId('following-data-created-text')).toBeVisible();
    await expect(this.page.getByTestId('created-schule-form-label')).toBeVisible();
    await expect(this.page.getByTestId('created-schule-dienststellennummer-label')).toBeVisible();
    await expect(this.page.getByTestId('created-schule-name-label')).toBeVisible();

    /* value column */
    await expect(this.page.getByTestId('created-schule-form'))
      .toContainText(this.selectedSchultraegerName);
    await expect(this.page.getByTestId('created-schule-dienststellennummer'))
      .toHaveText(params.dienststellenNr);
    await expect(this.page.getByTestId('created-schule-name'))
      .toHaveText(params.name);
  }
}
