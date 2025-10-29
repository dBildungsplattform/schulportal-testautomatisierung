import { Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../admin/organisationen/klassen/KlasseManagementView.neu.page';
import { PersonCreationViewPage } from '../admin/personen/creation/PersonCreationView.neu.page';
// TODO: implement PersonSearchViewPage
// import { PersonSearchViewPage } from '../admin/personen/creation/PersonSearchView.neu.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.neu.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.neu.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.neu.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.neu.page';
import { SchuleCreationViewPage } from '../admin/organisationen/schulen/SchuleCreationView.neu.page';
import { SchuleManagementViewPage } from '../admin/organisationen/schulen/SchuleManagementView.neu.page';
import { StartViewPage } from '../StartView.neu.page';

export class MenuBarPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  /* actions */
  private async navigateTo(testId: string, pageClass: any, waitForPageLoad: (page: any) => Promise<void>): Promise<any> {
    await this.page.getByTestId(testId).click();
    const newPage: any = new pageClass(this.page);
    await waitForPageLoad.call(newPage);
    return newPage;
  }

  public async navigateToStartPage(): Promise<StartViewPage> {
    return this.navigateTo('back-to-start-link', StartViewPage, p => p.waitForPageLoad());
  }

  public async navigateToPersonManagement(): Promise<PersonManagementViewPage> {
    return this.navigateTo('person-management-menu-item', PersonManagementViewPage, p => p.waitForPageLoad());
  }

  public async navigateToPersonCreation(): Promise<PersonCreationViewPage> {
    return this.navigateTo('person-creation-menu-item', PersonCreationViewPage, p => p.waitForPageLoad('Neuen Benutzer hinzufügen'));
  }

  public async navigateToPersonImport(): Promise<PersonImportViewPage> {
    return this.navigateTo('person-import-menu-item', PersonImportViewPage, p => p.waitForPageLoad());
  }

  // TODO: implement PersonSearchViewPage
  // public async navigateToPersonSearch(): Promise<PersonSearchViewPage> {
  //   return this.navigateTo('person-search-menu-item', PersonSearchViewPage, PersonSearchViewPage.prototype.waitForPageLoad);
  // }

  public async navigateToPersonAdd(): Promise<PersonCreationViewPage> {
    return this.navigateTo('person-add-menu-item', PersonCreationViewPage, p => p.waitForPageLoad('Andere Person (neu anlegen)'));
  }

  public async navigateToKlasseManagement(): Promise<KlasseManagementViewPage> {
    return this.navigateTo('klasse-management-menu-item', KlasseManagementViewPage, p => p.waitForPageLoad());
  }

  public async navigateToKlasseCreation(): Promise<KlasseCreationViewPage> {
    return this.navigateTo('klasse-creation-menu-item', KlasseCreationViewPage, p => p.waitForPageLoad());
  }

  public async navigateToRolleManagement(): Promise<RolleManagementViewPage> {
    return this.navigateTo('rolle-management-menu-item', RolleManagementViewPage, p => p.waitForPageLoad());
  }

  public async navigateToRolleCreation(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('rolle-creation-menu-item').click();
    const rolleCreationViewPage: RolleCreationViewPage = new RolleCreationViewPage(this.page);
    await rolleCreationViewPage.waitForPageLoad();
    return rolleCreationViewPage;
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    return this.navigateTo('schule-management-menu-item', SchuleManagementViewPage, p => p.waitForPageLoad());
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    return this.navigateTo('schule-creation-menu-item', SchuleCreationViewPage, p => p.waitForPageLoad());
  }

  /* assertions */
}
