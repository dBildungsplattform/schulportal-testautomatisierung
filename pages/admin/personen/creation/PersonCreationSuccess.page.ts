import { expect, Locator, Page } from '@playwright/test';
import { PersonCreationParams, PersonCreationViewPage } from './PersonCreationView.neu.page';

export type PersonCreationSuccessValidationParams = PersonCreationParams & {
  dstNr?: string;
};

export class PersonCreationSuccessPage {
  readonly dataRolle: Locator;
  readonly buttonBackToList: Locator;
  readonly buttonCreateAnother: Locator;

  constructor(protected readonly page: Page) {
    this.dataRolle = page.getByTestId('created-person-rolle');
    this.buttonBackToList = page.getByTestId('back-to-list-button');
    this.buttonCreateAnother = page.getByTestId('create-another-person-button');
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('person-success-text').waitFor({ state: 'visible' });
  }

  private getBenutzernameField(): Locator{
    return this.page.getByTestId('created-person-username');
  }

  public async getBenutzername(): Promise<string> {
    const benutzernameField: Locator = await this.getBenutzernameField();
    return benutzernameField.innerText();
  }

  public async getEinstiegsPasswort(): Promise<string> {
    return this.page.getByTestId('password-output-field').locator('input').inputValue();
  }

  public async navigateToCreateAnother(): Promise<PersonCreationViewPage> {
    await this.buttonCreateAnother.click();
    return new PersonCreationViewPage(this.page).waitForPageLoad();
  }

  public async navigateToPersonDetails(): Promise<void> {
    await this.page.getByTestId('go-to-details-button').click();
  }

  public async navigateBack(): Promise<void> {
    await this.buttonBackToList.click();
  }

  /* assertions */
  public async assertNavigationButtonsVisible(): Promise<void> {
    await expect(this.buttonCreateAnother).toBeVisible();
    await expect(this.buttonBackToList).toBeVisible();
  }
  public async assertSuccessfulCreation(params: PersonCreationSuccessValidationParams): Promise<void> {
    await expect(this.page.getByTestId('person-success-text')).toHaveText(
      `${params.vorname} ${params.nachname} wurde erfolgreich hinzugefügt.`
    );
    await expect(this.page.getByTestId('person-success-icon')).toBeVisible();
    await expect(this.page.getByTestId('following-data-created-text')).toBeVisible();

    await expect(this.page.getByTestId('created-person-vorname-label')).toBeVisible();
    await expect(this.page.getByTestId('created-person-vorname')).toHaveText(params.vorname);

    await expect(this.page.getByTestId('created-person-familienname-label')).toBeVisible();
    await expect(this.page.getByTestId('created-person-familienname')).toHaveText(params.nachname);

    if (params.kopersnr) {
      await expect(this.page.getByTestId('created-person-kopersnr-label')).toBeVisible();
      await expect(this.page.getByTestId('created-person-kopersnr')).toHaveText(params.kopersnr);
    }

    await expect(this.page.getByTestId('created-person-username-label')).toBeVisible();
    await expect(this.getBenutzernameField()).toContainText('tautopw');

    await expect(this.page.getByTestId('created-person-start-password-label')).toBeVisible();
    await expect(this.page.getByTestId('password-output-field').locator('input')).toBeVisible();

    await expect(this.page.getByTestId('created-person-organisation-label')).toBeVisible();
    if (params.dstNr)
      await expect(this.page.getByTestId('created-person-organisation')).toHaveText(
        `${params.dstNr} (${params.organisation})`
      );
    else await expect(this.page.getByTestId('created-person-organisation')).toHaveText(params.organisation);

    await expect(this.page.getByTestId('created-person-rolle-label')).toBeVisible();
    for (const rolle of params.rollen) {
      await expect(this.page.getByTestId('created-person-rolle')).toContainText(rolle);
    }

    if (params.befristung) {
      await expect(this.page.getByTestId('created-person-befristung-label')).toBeVisible();
      await expect(this.page.getByTestId('created-person-befristung')).toHaveText(params.befristung);
    }

    if (params.klasse) {
      await expect(this.page.getByTestId('created-person-klasse-label')).toBeVisible();
      await expect(this.page.getByTestId('created-person-klasse')).toHaveText(params.klasse);
    }
  }
}
