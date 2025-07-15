import { expect, Page } from '@playwright/test';
import { AbstractAdminPage } from '../../../AbstractAdminPage.page';
import { PersonCreationParams } from './PersonCreationView.neu.page';

export type PersonCreationSuccessValidationParams = PersonCreationParams & {
  dstNr?: string;
};

export class PersonCreationSuccessPage extends AbstractAdminPage {
  constructor(page: Page) {
    super(page);
  }

  /* actions */
  async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('person-success-text').waitFor({ state: 'visible' });
  }

  /* assertions */
  public async checkSuccessfulCreation(params: PersonCreationSuccessValidationParams): Promise<void> {
    await this.checkHeadline(params.vorname, params.nachname);

    await this.checkNames(params.vorname, params.nachname);

    if (params.kopersnr) await this.checkKopersnr(params.kopersnr);

    await this.checkBenutzername();

    await this.checkEinstiegspasswort();

    await this.checkOrganisationsebene(params.organisation, params.dstNr);

    await this.checkRollen(params.rollen);

    if (params.befristung) await this.checkBefristung(params.befristung);

    if (params.klasse) {
      this.checkKlasse(params.klasse);
    }
  }

  public async checkHeadline(vorname: string, nachname: string): Promise<void> {
    await expect(this.page.getByTestId('person-success-text')).toHaveText(
      `${vorname} ${nachname} wurde erfolgreich hinzugefügt.`
    );
    await expect(this.page.locator('.mdi-check-circle')).toBeVisible();
    await expect(this.page.getByText('Folgende Daten wurden gespeichert:')).toBeVisible();
  }

  public async checkNames(vorname: string, nachname: string): Promise<void> {
    await expect(this.page.getByText('Vorname:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-vorname')).toHaveText(vorname);

    await expect(this.page.getByText('Nachname:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-familienname')).toHaveText(nachname);
  }

  public async checkBenutzername(): Promise<void> {
    await expect(this.page.getByText('Benutzername:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-username')).toContainText('tautopw');
  }

  public async checkEinstiegspasswort(): Promise<void> {
    await expect(this.page.getByText(' Einstiegs-Passwort:', { exact: true })).toBeVisible();
    await expect(this.page.locator('[data-testid="password-output-field"] input')).toBeVisible();
  }

  public async checkRollen(rollen: Array<string>): Promise<void> {
    await expect(this.page.getByText('Rolle:', { exact: true })).toBeVisible();
    for (const rolle of rollen) {
      await expect(this.page.getByTestId('created-person-rolle')).toContainText(rolle);
    }
  }

  public async checkOrganisationsebene(organisation: string, dstNr?: string): Promise<void> {
    await expect(this.page.getByText('Organisationsebene:', { exact: true })).toBeVisible();
    if (dstNr)
      await expect(this.page.getByTestId('created-person-organisation')).toHaveText(`${dstNr} (${organisation})`);
    else await expect(this.page.getByTestId('created-person-organisation')).toHaveText(organisation);
  }

  public async checkKopersnr(kopersnr: string): Promise<void> {
    await expect(this.page.getByText('KoPers.-Nr.:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-kopersnr')).toHaveText(kopersnr);
  }

  public async checkBefristung(befristung: string): Promise<void> {
    await expect(this.page.getByText('Befristung:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-befristung')).toHaveText(befristung);
  }

  public async checkKlasse(klasse: string): Promise<void> {
    await expect(this.page.getByText('Klasse:', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('created-person-klasse')).toHaveText(klasse);
  }
}
