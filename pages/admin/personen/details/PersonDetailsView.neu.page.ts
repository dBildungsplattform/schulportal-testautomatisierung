import { expect, Locator, Page } from '@playwright/test';
import { waitForAPIResponse } from '../../../../base/api/testHelper.page';
import { AbstractAdminPage } from '../../../abstracts/AbstractAdminPage.page';
import { ZuordnungenPage, ZuordnungValidationParams } from './Zuordnungen.page';

interface PersonDetailsValidationParams { 
  username: string
}

interface LockValidationParams {
  locked: boolean;
  from?: string;
  until?: string;
  reason?: string;
  organisation?: string;
}

export class PersonDetailsViewPage extends AbstractAdminPage {
  private readonly zuordnungSection: ZuordnungenPage;

  constructor(page: Page) {
    super(page);
    this.zuordnungSection = new ZuordnungenPage(page);
  }

  /* actions */

  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('person-details-card').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('Benutzer bearbeiten');
  }

  public async changePassword(fullName: string): Promise<void> {
    await this.page.getByTestId('open-password-reset-dialog-button').click();

    const successText: Locator = this.page.getByTestId('password-reset-info-text');
    await expect(successText).toContainText(`Sind Sie sicher, dass Sie das Passwort für ${fullName} zurücksetzen möchten?`);
    await this.page.getByTestId('password-reset-button').click();
    await expect(successText).toContainText(`Das Passwort wurde erfolgreich zurückgesetzt.`);
    await this.page.getByTestId('close-password-reset-dialog-button').click();
  }

  public async editZuordnungen(): Promise<ZuordnungenPage> {
    await this.zuordnungSection.editZuordnungen();
    return this.zuordnungSection;
  }

  public async addSoftwareToken(): Promise<void> {
    const dialogHeadline: Locator = this.page
      .getByTestId('two-factor-authentication-dialog')
      .getByTestId('layout-card-headline');

    await this.page.getByTestId('open-2FA-dialog-icon').click();
    await expect(dialogHeadline).toHaveText('Zwei-Faktor-Authentifizierung einrichten');
    await expect(this.page.getByTestId('software-token-radio-button')).toHaveText('Software-Token einrichten');
    await expect(
      this.page.getByText('Ein QR-Code wird generiert, welcher direkt eingescannt oder ausgedruckt werden kann.')
    ).toBeVisible();
    await this.page.getByTestId('proceed-two-factor-authentication-dialog-button').click();
    await waitForAPIResponse(this.page, '2fa-token/**/');
    await expect(dialogHeadline).toHaveText('Software-Token einrichten');
    await expect(this.page.getByTestId('software-token-dialog-text')).toHaveText('QR-Code scannen oder ausdrucken.');
    await this.page.getByTestId('close-software-token-dialog-button').click();
  }

  public async createInbetriebnahmePasswort(): Promise<void> {
    await this.page.getByTestId('open-device-password-dialog-button').click();
    await this.page.getByTestId('password-reset-button').click();
    await waitForAPIResponse(this.page, 'personen/**/uem-password');
    await expect(this.page.getByTestId('password-reset-info-text')).toContainText(
      'Das Passwort wurde erfolgreich erzeugt.'
    );
    await this.page.getByTestId('close-password-reset-dialog-button').click();
    await this.waitForPageLoad();
  }

  public async lockPerson(until?: string): Promise<void> {
    await this.page.getByTestId('open-lock-dialog-button').click();
    await expect(this.page.getByTestId('person-lock-card').getByTestId('layout-card-headline')).toHaveText(
      'Benutzer sperren'
    );
    await expect(this.page.getByTestId('person-lock-card').locator('input')).toHaveText(
      'Land Schleswig-Holstein'
    );
    await expect(this.page.getByTestId('lock-user-info-text')).toHaveText(
      'Für die Dauer der Sperre hat der Benutzer keinen Zugriff mehr auf das Schulportal SH und die daran angeschlossenen Dienste.'
    );
    const befristungInput: Locator = this.page.getByTestId('befristung-input').getByPlaceholder('TT.MM.JJJJ');
    if (until) {
      await this.page.getByTestId('befristet-radio-button').getByLabel('Befristet').click();
      await expect(befristungInput).toBeVisible();
      await befristungInput.fill(until);
    } else {
      await expect(befristungInput).toBeHidden();
    }
    await this.page.getByTestId('lock-user-button').click();
  }

  public async deletePerson(): Promise<void> {
    await this.page.getByTestId('open-person-delete-dialog-button').click();
    await this.page.getByTestId('person-delete-button').click();
    await this.page.getByTestId('close-person-delete-success-dialog-button').click();
  }

  /* assertions */
  public async checkSections(expectedOptionalSections?: {
    twoFactor?: boolean;
    inbetriebnahmePasswort?: boolean;
  }): Promise<void> {
    await expect(this.page.getByTestId('password-reset-section-headline')).toBeVisible();
    await expect(this.page.getByTestId('zuordnungen-section-headline')).toBeVisible();
    await expect(this.page.getByTestId('status-section-headline')).toBeVisible();

    if (expectedOptionalSections?.twoFactor) {
      await expect(this.page.getByTestId('two-factor-section-headline')).toBeVisible();
    }
    
    if (expectedOptionalSections?.inbetriebnahmePasswort) {
      await expect(this.page.getByTestId('device-password-section-headline')).toBeVisible();
    }
  }

  public async checkInformation(params: PersonDetailsValidationParams): Promise<void> {
    await expect(this.page.getByTestId('person-username')).toHaveText(params.username);
  }

  public async check2FASetup(hasBeenSetup: boolean): Promise<void> {
    if (hasBeenSetup) {
      await expect(this.page.getByTestId('software-factor-setup-text')).toBeVisible();

      await expect(this.page.getByTestId('two-factor-reset-info-text')).toBeVisible();

    } else await expect(this.page.getByTestId('two-factor-not-setup-text')).toBeVisible();
  }

  public async checkZuordnungExists(params: ZuordnungValidationParams): Promise<void> {
    await this.zuordnungSection.checkZuordnungExists(params);
  }

  public async checkPendingText(): Promise<void> {
    await expect(this.page.getByTestId('check-and-save-headline')).toBeVisible();
  }

  public async checkPendingZuordnungen(params: ZuordnungValidationParams): Promise<void> {
    await this.zuordnungSection.checkPendingZuordnungen(params);
  }

  public async checkSelectedBefristungOption(option: 'unbefristet' | 'schuljahresende'): Promise<void> {
    await this.zuordnungSection.checkSelectedBefristungOption(option);
  }

  public async checkPersonLock(params: LockValidationParams): Promise<void> {
    const icon: Locator = this.page.getByTestId('person-lock-info').locator('i');

    if (params.locked) {
      await expect(icon).toBeVisible();
      await expect(this.page.getByTestId('user-lock-status-text')).toHaveText('Dieser Benutzer ist gesperrt.');
      if (params.from) {
        await expect(this.page.getByTestId('lock-info-1-attribute')).toHaveText(params.from);
      }
      if (params.until) {
        await expect(this.page.getByTestId('lock-info-2-attribute')).toHaveText(params.until);
      }
    } else {
      await expect(icon).toBeHidden();
      await expect(this.page.getByTestId('user-lock-status-text')).toHaveText('Dieser Benutzer ist aktiv.');
    }
  }
}
