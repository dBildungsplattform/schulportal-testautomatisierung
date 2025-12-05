import { Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../admin/organisationen/klassen/KlasseManagementView.neu.page';
import { PersonCreationViewPage } from '../admin/personen/creation/PersonCreationView.neu.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.neu.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.neu.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.page';
import { SchuleCreationViewPage } from '../admin/organisationen/schulen/SchuleCreationView.neu.page';
import { SchuleManagementViewPage } from '../admin/organisationen/schulen/SchuleManagementView.neu.page';
import { LandesbedienstetenSearchFormPage } from '../admin/personen/search/LandesbedienstetenSearchForm.page';
import { StartViewPage } from '../StartView.neu.page';

export class MenuBarPage {
  /* add locators here */

  constructor(protected readonly page: Page) {}

  /* actions */

  private async navigateTo<T>(testId: string, waitForPageLoad: Promise<T>): Promise<T> {
    await this.page.getByTestId(testId).click();
    return waitForPageLoad;
  }

  public async navigateToStartPage(): Promise<StartViewPage> {
    return this.navigateTo('back-to-start-link', new StartViewPage(this.page).waitForPageLoad());
  }

  public async navigateToPersonManagement(): Promise<PersonManagementViewPage> {
    return this.navigateTo('person-management-menu-item', new PersonManagementViewPage(this.page).waitForPageLoad());
  }

  public async navigateToPersonCreation(): Promise<PersonCreationViewPage> {
    return this.navigateTo('person-creation-menu-item', new PersonCreationViewPage(this.page).waitForPageLoad('Neuen Benutzer hinzufügen'));
  }

  public async navigateToPersonImport(): Promise<PersonImportViewPage> {
    return this.navigateTo('person-import-menu-item', new PersonImportViewPage(this.page).waitForPageLoad());
  }

  public async navigateToLandesbedienstetenSuchenUndHinzufuegen(): Promise<LandesbedienstetenSearchFormPage> {
    return this.navigateTo('person-search-menu-item', new LandesbedienstetenSearchFormPage(this.page).waitForPageLoad());
  }

  public async navigateToPersonAdd(): Promise<PersonCreationViewPage> {
    return this.navigateTo('person-add-menu-item', new PersonCreationViewPage(this.page).waitForPageLoad('Andere Person (neu anlegen)'));
  }

  public async navigateToKlasseManagement(): Promise<KlasseManagementViewPage> {
    return this.navigateTo('klasse-management-menu-item', new KlasseManagementViewPage(this.page).waitForPageLoad());
  }

  public async navigateToKlasseCreation(): Promise<KlasseCreationViewPage> {
    return this.navigateTo('klasse-creation-menu-item', new KlasseCreationViewPage(this.page).waitForPageLoad());
  }

  public async navigateToRolleManagement(): Promise<RolleManagementViewPage> {
    return this.navigateTo('rolle-management-menu-item', new RolleManagementViewPage(this.page).waitForPageLoad());
  }

  public async navigateToRolleCreation(): Promise<RolleCreationViewPage> {
    return this.navigateTo('rolle-creation-menu-item', new RolleCreationViewPage(this.page).waitForPageLoad())
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    return this.navigateTo('schule-management-menu-item', new SchuleManagementViewPage(this.page).waitForPageLoad());
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    return this.navigateTo('schule-creation-menu-item', new SchuleCreationViewPage(this.page).waitForPageLoad());
  }

  /* assertions */
}