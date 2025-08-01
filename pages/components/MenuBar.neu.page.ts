import { expect, Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../admin/organisationen/KlasseManagementView.neu.page';
import { PersonCreationViewPage } from '../admin/personen/creation/PersonCreationView.neu.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.neu.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.neu.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.neu.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.neu.page';
import { SchuleCreationViewPage } from '../admin/organisationen/SchuleCreationView.neu.page';
import { SchuleManagementViewPage } from '../admin/organisationen/SchuleManagementView.neu.page';
import { StartViewPage } from '../StartView.neu.page';

export class MenuBarPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async navigateToStartPage(): Promise<StartViewPage> {
    await this.page.getByTestId('back-to-start-link').click();
    return new StartViewPage(this.page);
  }

  public async navigateToPersonManagement(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('person-management-menu-item').click();
    return new PersonManagementViewPage(this.page);
  }

  public async navigateToPersonCreation(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-creation-menu-item').click();
    return new PersonCreationViewPage(this.page);
  }

  public async navigateToPersonImport(): Promise<PersonImportViewPage> {
    await this.page.getByTestId('person-import-menu-item').click();
    return new PersonImportViewPage(this.page);
  }

  public async navigateToPersonSerch(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-search-menu-item').click();
    return new PersonCreationViewPage(this.page);
  }

  public async navigateToPersonAdd(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-add-menu-item').click();
    return new PersonCreationViewPage(this.page);
  }

  public async navigateToKlasseManagement(): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('klasse-management-menu-item').click();
    return new KlasseManagementViewPage(this.page);
  }

  public async navigateToKlasseCreation(): Promise<KlasseCreationViewPage> {
    await this.page.getByTestId('klasse-creation-menu-item').click();
    return new KlasseCreationViewPage(this.page);
  }

  public async navigateToRolleManagement(): Promise<RolleManagementViewPage> {
    await this.page.getByTestId('rolle-management-menu-item').click();
    return new RolleManagementViewPage(this.page);
  }

  public async navigateToRolleCreation(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('rolle-creation-menu-item').click();
    return new RolleCreationViewPage(this.page);
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    await this.page.getByTestId('schule-management-menu-item').click();
    return new SchuleManagementViewPage(this.page);
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    await this.page.getByTestId('schule-creation-menu-item').click();
    return new SchuleCreationViewPage(this.page);
  }

  /* assertions */
}
