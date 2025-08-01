import { expect, Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../admin/organisationen/KlasseManagementView.neu.page';
import { PersonCreationViewPage } from '../admin/personen/creation/PersonCreationView.neu.page';
// TODO: implement PersonSearchViewPage
// import { PersonSearchViewPage } from '../admin/personen/creation/PersonSearchView.neu.page';
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
    const startViewPage: StartViewPage = new StartViewPage(this.page);
    await startViewPage.waitForPageLoad();
    return startViewPage;
  }

  public async navigateToPersonManagement(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('person-management-menu-item').click();
    const personManagementViewPage: PersonManagementViewPage = new PersonManagementViewPage(this.page);
    await personManagementViewPage.waitForPageLoad();
    return personManagementViewPage;
  }

  public async navigateToPersonCreation(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-creation-menu-item').click();
    const personCreationViewPage: PersonCreationViewPage = new PersonCreationViewPage(this.page);
    await personCreationViewPage.waitForPageLoad('Neuen Benutzer hinzufügen');
    return personCreationViewPage;
  }

  public async navigateToPersonImport(): Promise<PersonImportViewPage> {
    await this.page.getByTestId('person-import-menu-item').click();
    const personImportViewPage: PersonImportViewPage = new PersonImportViewPage(this.page);
    await personImportViewPage.waitForPageLoad();
    return personImportViewPage;
  }

  // TODO: implement PersonSearchViewPage
  // public async navigateToPersonSearch(): Promise<PersonSearchViewPage> {
  //   await this.page.getByTestId('person-search-menu-item').click();
  //   const personSearchViewPage: PersonSearchViewPage = new PersonSearchViewPage(this.page);
  //   await personSearchViewPage.waitForPageLoad();
  //   return personSearchViewPage;
  // }

  public async navigateToPersonAdd(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-add-menu-item').click();
    const personCreationViewPage: PersonCreationViewPage = new PersonCreationViewPage(this.page);
    await personCreationViewPage.waitForPageLoad('Andere Person (neu anlegen)');
    return personCreationViewPage;
  }

  public async navigateToKlasseManagement(): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('klasse-management-menu-item').click();
    const klasseManagementViewPage: KlasseManagementViewPage = new KlasseManagementViewPage(this.page);
    await klasseManagementViewPage.waitForPageLoad();
    return klasseManagementViewPage;
  }

  public async navigateToKlasseCreation(): Promise<KlasseCreationViewPage> {
    await this.page.getByTestId('klasse-creation-menu-item').click();
    const klasseCreationViewPage: KlasseCreationViewPage = new KlasseCreationViewPage(this.page);
    await klasseCreationViewPage.waitForPageLoad();
    return klasseCreationViewPage;
  }

  public async navigateToRolleManagement(): Promise<RolleManagementViewPage> {
    await this.page.getByTestId('rolle-management-menu-item').click();
    const rolleManagementViewPage: RolleManagementViewPage = new RolleManagementViewPage(this.page);
    await rolleManagementViewPage.waitForPageLoad();
    return rolleManagementViewPage;
  }

  public async navigateToRolleCreation(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('rolle-creation-menu-item').click();
    const rolleCreationViewPage: RolleCreationViewPage = new RolleCreationViewPage(this.page);
    await rolleCreationViewPage.waitForPageLoad();
    return rolleCreationViewPage;
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    await this.page.getByTestId('schule-management-menu-item').click();
    const schuleManagementViewPage: SchuleManagementViewPage = new SchuleManagementViewPage(this.page);
    await schuleManagementViewPage.waitForPageLoad();
    return schuleManagementViewPage;
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    await this.page.getByTestId('schule-creation-menu-item').click();
    const schuleCreationViewPage: SchuleCreationViewPage = new SchuleCreationViewPage(this.page);
    await schuleCreationViewPage.waitForPageLoad();
    return schuleCreationViewPage;
  }

  /* assertions */
}
