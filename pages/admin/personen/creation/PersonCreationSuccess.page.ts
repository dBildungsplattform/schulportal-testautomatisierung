import { expect, Locator, Page } from '@playwright/test';
import { PersonCreationParams } from './PersonCreationView.neu.page';
import { AbstractAdminPage } from '../../AbstractAdmin.page';

export type PersonCreationSuccessValidationParams = PersonCreationParams & {
  dstNr?: string;
};

export class PersonCreationSuccessPage extends AbstractAdminPage {
  constructor(protected readonly page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<typeof this> {
    await this.page.getByTestId('person-success-text').waitFor({ state: 'visible' });
    return this;
  }

  private getBenutzernameField(): Locator{
    return this.page.getByTestId('created-person-username');
  }

  public async getBenutzername(): Promise<string> {
    const benutzernameField: Locator = this.getBenutzernameField();
    return benutzernameField.innerText();
  }

  private getPasswordField(): Locator{
    return this.page.getByTestId('password-output-field').locator('input');
  }

  public async getPassword(): Promise<string> {
    await this.page.getByTestId('show-password-icon').click();
    const passwordField: Locator = this.getPasswordField();
    return passwordField.inputValue();
  }

  /* assertions */
  public async checkSuccessfulCreation(params: PersonCreationSuccessValidationParams): Promise<void> {
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
    await expect(this.getPasswordField()).toBeVisible();

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
