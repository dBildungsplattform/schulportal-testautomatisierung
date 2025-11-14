import { Locator, Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/klassen/KlasseCreationView.neu.page';
import { KlasseManagementViewPage } from '../admin/organisationen/klassen/KlasseManagementView.neu.page';
import { PersonCreationViewPage } from '../admin/personen/creation/PersonCreationView.neu.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.neu.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.neu.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.neu.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.neu.page';
import { SchuleCreationViewPage } from '../admin/organisationen/schulen/SchuleCreationView.neu.page';
import { SchuleManagementViewPage } from '../admin/organisationen/schulen/SchuleManagementView.neu.page';
import { StartViewPage } from '../StartView.neu.page';
import { LandesbedienstetenSuchenUndHinzufuegenPage } from '../admin/personen/LandesbedienstetenSuchenUndHinzufuegen.page';

export class MenuBarPage {
  /* add locators here */
  private landesbedienstetenSuchenUndHinzufuegen: Locator = this.page.getByTestId('person-search-menu-item');
  private startPage: Locator = this.page.getByTestId('back-to-start-link');
  private personManagement: Locator = this.page.getByTestId('person-management-menu-item');
  private personCreation: Locator = this.page.getByTestId('person-creation-menu-item');
  private personImport: Locator = this.page.getByTestId('person-import-menu-item');
  private limitedPersonCreation: Locator = this.page.getByTestId('person-add-menu-item');
  private klasseManagement: Locator = this.page.getByTestId('klasse-management-menu-item');
  private klasseCreation: Locator = this.page.getByTestId('klasse-creation-menu-item');
  private rolleManagement: Locator = this.page.getByTestId('rolle-management-menu-item');
  private rolleCreation: Locator = this.page.getByTestId('rolle-creation-menu-item');
  private schuleManagement: Locator = this.page.getByTestId('schule-management-menu-item');
  private schuleCreation: Locator = this.page.getByTestId('schule-creation-menu-item');

  constructor(protected readonly page: Page) {}

  /* actions */
  public async navigateToStartPage(): Promise<StartViewPage> {
    await this.startPage.click();
    const newPage: StartViewPage = new StartViewPage(this.page);
    await newPage.waitForPageLoad();
    return newPage;
  }

  public async navigateToPersonManagement(): Promise<PersonManagementViewPage> {
    await this.personManagement.click();
    const newPage: PersonManagementViewPage = new PersonManagementViewPage(this.page);
    await newPage.waitForPageLoad();
    return newPage;
  }

  public async navigateToPersonCreation(): Promise<PersonCreationViewPage> {
    await this.personCreation.click();
    const personCreationViewPage: PersonCreationViewPage = new PersonCreationViewPage(this.page);
    await personCreationViewPage.waitForPageLoad();
    return personCreationViewPage;
  }

  public async navigateToPersonImport(): Promise<PersonImportViewPage> {
    await this.personImport.click();
    const personImportViewPage: PersonImportViewPage = new PersonImportViewPage(this.page);
    await personImportViewPage.waitForPageLoad();
    return personImportViewPage;
  }

  public async navigateToLimitedPersonCreation(): Promise<PersonCreationViewPage> {
    await this.limitedPersonCreation.click();
    const personCreationViewPage: PersonCreationViewPage = new PersonCreationViewPage(this.page);
    await personCreationViewPage.waitForPageLoad();
    return personCreationViewPage;
  }

  public async navigateToLandesbedienstetenSuchenUndHinzufuegen(): Promise<LandesbedienstetenSuchenUndHinzufuegenPage> {
    await this.landesbedienstetenSuchenUndHinzufuegen.click();
    const newPage: LandesbedienstetenSuchenUndHinzufuegenPage = new LandesbedienstetenSuchenUndHinzufuegenPage(this.page);
    await newPage.waitForPageLoad();
    return newPage;
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
    await this.rolleCreation.click();
    const rolleCreationViewPage: RolleCreationViewPage = new RolleCreationViewPage(this.page);
    await rolleCreationViewPage.waitForPageLoad();
    return rolleCreationViewPage;
  }

  public async navigateToSchuleManagement(): Promise<SchuleManagementViewPage> {
    await this.schuleManagement.click();
    const schuleManagementViewPage: SchuleManagementViewPage = new SchuleManagementViewPage(this.page);
    await schuleManagementViewPage.waitForPageLoad();
    return schuleManagementViewPage;
  }

  public async navigateToSchuleCreation(): Promise<SchuleCreationViewPage> {
    await this.schuleCreation.click();
    const schuleCreationViewPage: SchuleCreationViewPage = new SchuleCreationViewPage(this.page);
    await schuleCreationViewPage.waitForPageLoad();
    return schuleCreationViewPage;
  }

  /* assertions */
}