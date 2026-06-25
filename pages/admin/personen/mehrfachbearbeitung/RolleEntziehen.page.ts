import { expect, Locator, Page } from '@playwright/test';

export class RolleEntziehenPage {
  private static readonly BULK_OPERATION_TIMEOUT_MS: number = 30_000;
  private static readonly LETZTE_ROLLENZUORDNUNG_ERROR_TEXT: string =
    'Die Rolle kann diesem Benutzer nicht entzogen werden, da dies die letzte Rollenzuordnung an der Schule ist und er dadurch von der Schule entfernt werden würde. Wenn Sie den Benutzer von der Schule entfernen möchten, führen Sie dies per Einzelbearbeitung (Schulzuordnung entfernen) oder über die Funktion Schulzuordnung(en) aufheben in der Mehrfachbearbeitung aus.';

  private readonly layoutCard: Locator;
  private readonly bulkErrorDialogCard: Locator;

  public constructor(private readonly page: Page) {
    this.layoutCard = this.page.getByTestId('rolle-unassign-layout-card');
    this.bulkErrorDialogCard = this.page.getByTestId('person-bulk-error-layout-card');
  }

  public async waitForPageToLoad(): Promise<RolleEntziehenPage> {
    await expect(this.layoutCard).toBeVisible();
    await expect(this.layoutCard.getByTestId('layout-card-headline')).toHaveText('Rolle entziehen');
    await expect(this.layoutCard.getByTestId('rolle-unassign-submit-button')).toBeVisible();
    await expect(this.layoutCard.getByTestId('rolle-unassign-discard-button')).toBeVisible();
    return this;
  }

  public async submit(): Promise<void> {
    await this.layoutCard.getByTestId('rolle-unassign-submit-button').click();
  }

  public async close(): Promise<void> {
    await this.layoutCard.getByTestId('rolle-unassign-close-button').click();
  }

  public async selectRolle(rolleName: string): Promise<void> {
    const rolleSelect: Locator = this.layoutCard.getByTestId('rolle-select');
    await rolleSelect.locator('.v-field__append-inner').click({ force: true });
    const rolleInput: Locator = rolleSelect.locator('input');
    await rolleInput.fill('');
    await rolleInput.pressSequentially(rolleName);
    const rolleOption: Locator = this.page.locator('.v-overlay .v-list-item').filter({
      hasText: new RegExp(`^${rolleName}$`),
    });
    await rolleOption.click();
    await expect(rolleSelect).toContainText(rolleName);
  }

  public async assertInProgress(): Promise<void> {
    const progressbar: Locator = this.layoutCard.getByTestId('rolle-unassign-progressbar');
    await expect(progressbar).toBeVisible();
  }

  public async assertSuccess(): Promise<void> {
    await expect(this.layoutCard).toBeVisible({ timeout: RolleEntziehenPage.BULK_OPERATION_TIMEOUT_MS });
    await expect(this.layoutCard.getByTestId('layout-card-headline')).toHaveText('Rolle entziehen');
    await expect(this.layoutCard).toContainText('Die Rolle wurde erfolgreich entfernt.');
    await expect(this.layoutCard.getByTestId('rolle-unassign-progressbar')).toHaveText('100%');
    await expect(this.layoutCard.getByTestId('rolle-unassign-close-button')).toBeVisible();
  }

  public async assertBulkErrorDialog(expectedErrorCount: number): Promise<void> {
    await expect(this.bulkErrorDialogCard).toBeVisible({ timeout: RolleEntziehenPage.BULK_OPERATION_TIMEOUT_MS });
    await expect(this.bulkErrorDialogCard.getByTestId('layout-card-headline')).toHaveText(
      'Fehler bei der Mehrfachbearbeitung',
    );

    for (let i = 0; i < expectedErrorCount; i++) {
      const errorItem: Locator = this.bulkErrorDialogCard.getByTestId(`person-bulk-error-error-list-item-${i}`);
      await expect(errorItem).toBeVisible();
      await expect(errorItem).toContainText(RolleEntziehenPage.LETZTE_ROLLENZUORDNUNG_ERROR_TEXT);
    }

    await expect(this.bulkErrorDialogCard.getByTestId('person-bulk-error-discard-button')).toBeVisible();
    await expect(this.bulkErrorDialogCard.getByTestId('person-bulk-error-save-button')).toBeVisible();
  }

  public async closeBulkErrorDialog(): Promise<void> {
    await this.bulkErrorDialogCard.getByTestId('person-bulk-error-discard-button').click();
    await this.page.getByTestId('confirm-close-bulk-error-dialog-button').click();
  }
}