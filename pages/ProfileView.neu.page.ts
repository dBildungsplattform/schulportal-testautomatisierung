import { expect, type Locator, Page } from '@playwright/test';
import { LoginViewPage } from './LoginView.neu.page';
import { RollenArt } from '../base/rollentypen';

interface Zuordnung {
  dienststellennummer?: string;
  kopersnummer?: string;
  organisationsname: string;
  rollenart: RollenArt;
  rollenname: string;
}

interface PersoenlicheDaten {
  kopersnummer?: string;
  nachname: string;
  rollenart: RollenArt;
  username: string;
  vorname: string;
}

export class ProfileViewPage {
  /* add global locators here */
  readonly loginViewPage: LoginViewPage;

  constructor(protected readonly page: Page) {
    this.loginViewPage = new LoginViewPage(page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    await this.page.getByTestId('profile-headline').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('profile-headline')).toHaveText('Mein Profil');
  }

  public async changePassword(username: string, password: string): Promise<string> {
    const passwordInput: Locator = this.page.getByTestId('password-input');
    const loginButton: Locator = this.page.getByTestId('login-button');

    await this.page.getByTestId('open-change-password-dialog-button').click();
    await this.page.getByTestId('change-password-button').click();

    await expect(this.page.getByTestId('attempted-username')).toHaveText(username);
    await expect(this.page.getByTestId('login-prompt-text')).toHaveText('Bitte geben Sie Ihr aktuelles Passwort ein.');
    
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();

    const newPassword: string = await this.loginViewPage.updatePassword();
    await this.page.getByTestId('close-password-changed-dialog-button').click();

    await expect(this.page.getByTestId('profile-headline')).toHaveText('Mein Profil');
    return newPassword;
  }

  public async resetDevicePassword (): Promise<void> {
    /* zuordnung card for password reset */
    await expect(this.page.getByTestId('reset-device-password-card-headline')).toBeVisible();
    await expect(this.page.getByTestId('device-password-info-text')).toBeVisible();
    await this.page.getByTestId('open-device-password-dialog-button').click();

    /* reset dialog */
    await expect(this.page.getByTestId('password-reset-dialog-header')).toHaveText('Inbetriebnahme-Passwort erzeugen');
    await expect(this.page.getByTestId('password-reset-info-text')).toHaveText(
      'Bitte notieren Sie sich das Passwort oder drucken Sie es aus. Nach dem Schließen des Dialogs wird das Passwort' +
        ' nicht mehr angezeigt. Sie benötigen dieses Passwort ausschließlich zur erstmaligen Anmeldung an Ihrem neuen LK-Endgerät.'
    );
    await this.page.getByTestId('password-reset-button').click();

    await this.validatePasswordResetDialog();
    await expect(this.page.getByTestId('profile-headline')).toBeVisible();
  }

  /* assertions */
  public async checkPersoenlicheDaten(persoenlicheDaten: PersoenlicheDaten): Promise<void> {
    await expect(this.page.getByTestId('layout-card-headline-persoenliche-daten')).toHaveText('Persönliche Daten');
    await expect(this.page.getByTestId('fullname-label')).toHaveText('Vor- und Nachname:');
    await expect(this.page.getByTestId('fullname-value')).toHaveText(persoenlicheDaten.vorname + ' ' + persoenlicheDaten.nachname);
    await expect(this.page.getByTestId('username-label')).toHaveText('Benutzername:');
    await expect(this.page.getByTestId('username-value')).toHaveText(persoenlicheDaten.username);

    if (persoenlicheDaten.rollenart === 'LEHR') {
      await expect(this.page.getByTestId('kopersnummer-label')).toHaveText('KoPers.-Nr. :');
      await expect(this.page.getByTestId('kopersnummer-value')).toBeVisible();
    } else {
      await expect(this.page.getByTestId('kopersnummer-label')).toBeHidden();
      await expect(this.page.getByTestId('kopersnummer-value')).toBeHidden();
    }
    await expect(this.page.getByTestId('info-icon')).toBeVisible();
  }

  // for each zuordnung, check if card is visible and contains the correct data
  public async checkZuordnungen(zuordnungen: Zuordnung[]): Promise<void> {
    for (let i: number = 0; i < zuordnungen.length; i++) {
      const zuordnung: Zuordnung = zuordnungen[i];
        await Promise.all([
          expect(this.page.getByTestId(`zuordnung-card-${i}-headline`)).toHaveText((zuordnungen.length === 1 ? 'Schulzuordnung' : `Schulzuordnung ${i + 1}`)),
          expect(this.page.getByTestId(`schule-label-${i}`)).toHaveText('Schule:'),
          expect(this.page.getByTestId(`schule-value-${i}`)).toHaveText(zuordnung.organisationsname),
          expect(this.page.getByTestId(`rolle-label-${i}`)).toHaveText('Rolle:'),
          expect(this.page.getByTestId(`rolle-value-${i}`)).toHaveText(zuordnung.rollenname)
        ]);

      if (zuordnung.rollenart === 'SYSADMIN') {
        await expect(this.page.getByTestId(`dienststellennummer-label-${i}`)).toBeHidden();
        await expect(this.page.getByTestId(`dienststellennummer-value-${i}`)).toBeHidden();
      }

      if (zuordnung.rollenart === 'LEIT' || zuordnung.rollenart === 'LEHR' || zuordnung.rollenart === 'LERN') {
        await expect(this.page.getByTestId(`dienststellennummer-label-${i}`)).toHaveText('DStNr.:');
        await expect(this.page.getByTestId(`dienststellennummer-value-${i}`)).toHaveText(zuordnung.dienststellennummer!);
      }
    }
  }

  public async validatePasswordResetDialog(): Promise<void> {
    await expect(this.page.getByTestId('password-reset-info-text')).toHaveText(`
      Das Passwort wurde erfolgreich zurückgesetzt. Bitte notieren Sie sich das Passwort oder drucken Sie es aus.
      Nach dem Schließen des Dialogs wird das Passwort nicht mehr angezeigt.
      Sie benötigen dieses Passwort ausschließlich zur erstmaligen Anmeldung an Ihrem neuen LK-Endgerät.
    `);
    await expect(this.page.getByTestId('password-output-field').locator('input')).toBeVisible();
    await expect(this.page.getByTestId('password-output-field').locator('input')).toHaveAttribute('readonly');
    await expect(this.page.getByTestId('show-password-icon')).toBeVisible();
    await expect(this.page.getByTestId('copy-password-icon')).toBeVisible()
    await this.page.getByTestId('close-password-reset-dialog-button').click();
  }
}
