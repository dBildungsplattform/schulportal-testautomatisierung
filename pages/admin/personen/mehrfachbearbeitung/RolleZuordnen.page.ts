import { expect, Locator, Page } from '@playwright/test';
import { Autocomplete } from '../../../components/Autocomplete';
import { BefristungsInput } from '../../../components/BefristungsInput.page';
import { PersonManagementViewPage } from '../PersonManagementView.page';

export class RolleZuordnenPage {
  private readonly layoutCard: Locator;
  private readonly organisationSelect: Autocomplete;
  private readonly rolleSelect: Autocomplete;
  private readonly befristungsInput: BefristungsInput;
  private readonly submitButton: Locator;

  public constructor(private page: Page) {
    this.layoutCard = this.page.getByTestId('rolle-modify-layout-card');
    this.organisationSelect = new Autocomplete(
      page,
      this.layoutCard.getByTestId('personenkontext-create-organisation-select'),
    );
    this.rolleSelect = new Autocomplete(page, this.layoutCard.getByTestId('rolle-select'));
    this.befristungsInput = new BefristungsInput(page);
    this.submitButton = this.layoutCard.getByTestId('rolle-modify-submit-button');
  }

  public async waitForPageToLoad(): Promise<void> {
    return expect(this.layoutCard).toContainText('Rolle zuordnen');
  }

  public async selectOrganisation(name: string): Promise<void> {
    await this.organisationSelect.searchByTitle(name, false);
  }

  public async selectRolle(name: string): Promise<void> {
    await this.rolleSelect.searchByTitle(name, true);
  }

  public async submitRolleAssignment(): Promise<void> {
    await this.submitButton.click();
  }

  public async closeModal(): Promise<PersonManagementViewPage> {
    await this.layoutCard.getByTestId('rolle-modify-close-button').click();
    return new PersonManagementViewPage(this.page).waitForPageLoad();
  }

  public async assertSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  public async assertSelectedOrganisation(expectedOrganisation: string): Promise<void> {
    await this.organisationSelect.assertText(expectedOrganisation, false);
  }

  public async assertKopersTextIsVisible(): Promise<void> {
    await expect(this.layoutCard.getByTestId('no-kopersnr-information')).toContainText(
      'Bitte beachten: Alle ausgewählten Benutzerkonten müssen über eine KoPers.-Nr. verfügen. Tragen Sie diese ggf. bitte in der Gesamtübersicht des Benutzers nach, sobald sie Ihnen vorliegt. Ein Benutzerkonto mit der gewählten Rolle ohne KoPers.-Nr. wird nach spätestens 8 Wochen automatisch gesperrt.',
    );
  }

  public async assertKopersTextIsNotVisible(): Promise<void> {
    await expect(this.layoutCard.getByTestId('no-kopersnr-information')).toBeHidden();
  }

  public async assertUnbefristetChecked(): Promise<void> {
    await this.befristungsInput.assertSelectedBefristungOption('unbefristet');
  }

  public async assertSchuljahresendeChecked(): Promise<void> {
    await this.befristungsInput.assertSelectedBefristungOption('schuljahresende');
  }

  public async assertSuccessMessageIsVisible(): Promise<void> {
    await expect(this.layoutCard).toContainText('Die Rolle wurde erfolgreich zugeordnet.');
  }
}
