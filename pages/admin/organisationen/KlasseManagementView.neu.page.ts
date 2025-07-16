import { expect, type Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../elements/Autocomplete';
import { DataTable } from '../../components/DataTable.neu.page';
import { AbstractAdminPage } from '../../AbstractAdminPage.page';

export class KlasseManagementViewPage extends AbstractAdminPage {
  /* add global locators here */
  readonly klasseTable: DataTable;

  constructor(page: Page) {
    super(page);

    this.klasseTable = new DataTable(this.page, this.page.getByTestId('klasse-table'));
  }

  /* actions */
  public async waitForPageLoad(): Promise<void> {
    return this.page.getByTestId('klasse-management-card').waitFor({ state: 'visible' });
  }

  public async filterBySchule(schulname: string): Promise<void> {
    const filterSchuleAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('schule-select'));

    await filterSchuleAutocomplete.searchByTitle(schulname, false);
  }

  public async filterByKlasse(klassenname: string): Promise<void> {
    const filterKlasseAutocomplete: Autocomplete = new Autocomplete(this.page, this.page.getByTestId('klasse-select'));

    await filterKlasseAutocomplete.searchByTitle(klassenname, false);
  }

  public async navigateToKlasseDetails(klassenname: string): Promise<void> {
    await this.klasseTable.getItemByText(klassenname).click();
  }

  public async deleteKlasse(klassenname: string, schulname: string): Promise<void> {
    const klasseDeletionButton: Locator = this.page.getByTestId('open-klasse-delete-dialog-icon');
    const klasseDeletionDialogText: Locator = this.page.getByTestId('klasse-delete-confirmation-text');
    const klasseDeletionDialogConfirmButton: Locator = this.page.getByTestId('klasse-delete-button');

    await klasseDeletionButton.click();
    await expect(klasseDeletionDialogText).toHaveText(`Wollen Sie die Klasse ${klassenname} an der Schule ${schulname} wirklich entfernen?`);
    await klasseDeletionDialogConfirmButton.click();
  }

  /* assertions */
  public async checkIfTableIsLoaded(numberOfRows: number, numberOfColumns: number, expectedHeaders: Array<string>): Promise<void> {
    await this.klasseTable.checkRows(numberOfRows);
    await this.klasseTable.checkColumns(numberOfColumns, expectedHeaders);
  }

  public async checkColumns(expectedAmount: number, expectedHeaders: Array<string>): Promise<void> {
    this.klasseTable.checkColumns(expectedAmount, expectedHeaders);
  }

  public async checkRows(expectedAmount: number): Promise<void> {
    this.klasseTable.checkRows(expectedAmount);
  }

  public async checkIfKlasseExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsVisible(klassenname);
  }

  public async checkIfKlasseNotExists(klassenname: string): Promise<void> {
    await this.klasseTable.checkIfItemIsNotVisible(klassenname);
  }

  public async klasseSuccessfullyDeleted(schulname: string, klassenname: string): Promise<void> {
    const closeDeletionSuccessButton: Locator = this.page.getByTestId('close-klasse-delete-success-dialog-button');
    const klasseDeletionSuccessText: Locator = this.page.getByTestId('klasse-delete-success-text');

    await expect(klasseDeletionSuccessText).toHaveText(`Die Klasse ${klassenname} an der Schule ${schulname} wurde erfolgreich gelöscht.`);
    await closeDeletionSuccessButton.click();
  }

  public async klasseDeletionFailed(): Promise<void> {
    const klasseDetailsErrorAlertText: Locator = this.page.getByTestId('klasse-details-error-alert-text');
    const klasseDetailsErrorAlertButton: Locator = this.page.getByTestId('klasse-details-error-alert-button');

    await expect(klasseDetailsErrorAlertText).toHaveText('Die Klasse kann nicht gelöscht werden, da noch Benutzer zugeordnet sind.');
    await klasseDetailsErrorAlertButton.click();
  }
}
