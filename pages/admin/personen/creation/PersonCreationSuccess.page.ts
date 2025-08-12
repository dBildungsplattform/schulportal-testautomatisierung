import { expect, Locator, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { PersonCreationParams } from './PersonCreationView.neu.page';

export type PersonCreationSuccessValidationParams = PersonCreationParams & {
  dstNr?: string;
};

export class PersonCreationSuccessPage extends AbstractAdminPage {
  constructor(page: Page) {
    super(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('person-success-text').waitFor({ state: 'visible' });
  }

  public async getBenutzername(): Promise<string> {
    const benutzernameField: Locator = await this.getBenutzernameField();
    return benutzernameField.innerText();
  }

  private async getBenutzernameField(): Promise<Locator> {
    return this.page.getByTestId('created-person-username');
  }

  /* assertions */
  public async checkSuccessfulCreation(params: PersonCreationSuccessValidationParams): Promise<void> {
    await expect(this.page.getByTestId('person-success-text')).toHaveText(
      `${params.vorname} ${params.nachname} wurde erfolgreich hinzugefügt.`
    );
    await expect(this.page.locator('.mdi-check-circle')).toBeVisible();
    await expect(this.page.getByText('Folgende Daten wurden gespeichert:')).toBeVisible();

    await expect(this.page.getByText('Vorname:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-vorname')).toHaveText(params.vorname);

    await expect(this.page.getByText('Nachname:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-familienname')).toHaveText(params.nachname);

    if (params.kopersnr) {
      await expect(this.page.getByText('KoPers.-Nr.:', { exact: true })).toBeVisible();
      await expect(this.page.getByTestId('created-person-kopersnr')).toHaveText(params.kopersnr);
    }

    await expect(this.page.getByText('Benutzername:', { exact: true })).toBeVisible();
    await expect(await this.getBenutzernameField()).toContainText('tautopw');

    await expect(this.page.getByText(' Einstiegs-Passwort:', { exact: true })).toBeVisible();
    await expect(this.page.locator('[data-testid="password-output-field"] input')).toBeVisible();

    await expect(this.page.getByText('Organisationsebene:', { exact: true })).toBeVisible();
    if (params.dstNr)
      await expect(this.page.getByTestId('created-person-organisation')).toHaveText(
        `${params.dstNr} (${params.organisation})`
      );
    else await expect(this.page.getByTestId('created-person-organisation')).toHaveText(params.organisation);

    await expect(this.page.getByText('Rolle:', { exact: true })).toBeVisible();
    for (const rolle of params.rollen) {
      await expect(this.page.getByTestId('created-person-rolle')).toContainText(rolle);
    }

    if (params.befristung) {
      await expect(this.page.getByText('Befristung:', { exact: true })).toBeVisible();
      await expect(this.page.getByTestId('created-person-befristung')).toHaveText(params.befristung);
    }

    if (params.klasse) {
      await expect(this.page.getByText('Klasse:', { exact: true })).toBeVisible();
      await expect(this.page.getByTestId('created-person-klasse')).toHaveText(params.klasse);
    }
  }
}
