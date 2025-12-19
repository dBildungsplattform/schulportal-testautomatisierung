import { Locator, Page } from '@playwright/test';
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
  /* add global locators here */
  private klasseManagement: Locator = this.page.getByTestId('klasse-management-menu-item');
  private klasseCreation: Locator = this.page.getByTestId('klasse-creation-menu-item');
  private schuleManagement: Locator = this.page.getByTestId('schule-management-menu-item');
  private rolleManagement: Locator = this.page.getByTestId('rolle-management-menu-item');

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
    await this.klasseManagement.click();
    const klasseManagementViewPage: KlasseManagementViewPage = new KlasseManagementViewPage(this.page);
    await klasseManagementViewPage.waitForPageLoad();
    return klasseManagementViewPage;
  }

  public async navigateToKlasseCreation(): Promise<KlasseCreationViewPage> {
    await this.klasseCreation.click();
    const klasseCreationViewPage: KlasseCreationViewPage = new KlasseCreationViewPage(this.page);
    await klasseCreationViewPage.waitForPageLoad();
    return klasseCreationViewPage;
  }

  public async navigateToRolleManagement(): Promise<RolleManagementViewPage> {
    await this.rolleManagement.click();
    const rolleManagementViewPage: RolleManagementViewPage = new RolleManagementViewPage(this.page);
    await rolleManagementViewPage.waitForPageLoad();
    return rolleManagementViewPage;
  }

  public async navigateToRolleCreation(): Promise<RolleCreationViewPage> {
    return this.navigateTo('rolle-creation-menu-item', new RolleCreationViewPage(this.page).waitForPageLoad())
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    await this.schuleManagement.click();
    const schuleManagementViewPage: SchuleManagementViewPage = new SchuleManagementViewPage(this.page);
    await schuleManagementViewPage.waitForPageLoad();
    return schuleManagementViewPage;
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    return this.navigateTo('schule-creation-menu-item', new SchuleCreationViewPage(this.page).waitForPageLoad());
  }

  /* assertions */
}