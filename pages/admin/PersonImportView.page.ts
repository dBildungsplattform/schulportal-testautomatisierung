import { type Locator, Page } from '@playwright/test';
import { PersonManagementViewPage } from './PersonManagementView.page';
import { ComboBox } from '../../elements/ComboBox';

export class PersonImportViewPage {
  readonly page: Page;
  readonly body: Locator;
  readonly personImportCard: Locator;
  readonly headlineBenutzerImport: Locator;
  readonly schuleSelectInput: Locator;
  readonly schuleSelectCombobox: ComboBox;
  readonly rolleSelectInput: Locator;
  readonly fileInput: Locator;
  readonly discardFileUploadButton: Locator;
  readonly submitFileUploadButton: Locator;
  readonly uploadSuccessText: Locator;
  readonly openConfirmationDialogButton: Locator;
  readonly importConfirmationText: Locator;
  readonly executeImportButton: Locator;
  readonly importSuccessText: Locator;
  readonly downloadFileButton: Locator;
  readonly closeCardButton: Locator;
  readonly confirmUnsavedChangesButton: Locator;
  
  constructor(page: Page) {
    // Benutzerimport
    this.page = page;  
    this.body = page.locator('body');
    this.personImportCard = page.getByTestId('person-import-card');
    this.headlineBenutzerImport = page.getByTestId('layout-card-headline');
    this.schuleSelectInput = page.getByTestId('schule-select').locator('input');
    this.schuleSelectCombobox = new ComboBox(this.page, this.schuleSelectInput,);
    this.rolleSelectInput = page.getByTestId('rolle-select').locator('input');
    this.fileInput = page.getByTestId('file-input').locator('input');
    this.discardFileUploadButton = page.getByTestId('person-import-form-discard-button');
    this.submitFileUploadButton = page.getByTestId('person-import-form-submit-button');
    this.uploadSuccessText = page.getByTestId('person-upload-success-text');
    this.openConfirmationDialogButton = page.getByTestId('open-confirmation-dialog-button');
    this.importConfirmationText = page.getByTestId('person-import-confirmation-text');
    this.executeImportButton = page.getByTestId('execute-import-button');
    this.importSuccessText = page.getByTestId('person-import-success-text');
    this.downloadFileButton = page.getByTestId('download-all-data-button');
    this.closeCardButton = page.getByTestId('close-layout-card-button');
    this.confirmUnsavedChangesButton = page.getByTestId('confirm-unsaved-changes-button');
  }

  public async navigateToPersonManagementView(): Promise<PersonManagementViewPage> {
    await this.closeCardButton.click();

    return new PersonManagementViewPage(this.page);
  }
}