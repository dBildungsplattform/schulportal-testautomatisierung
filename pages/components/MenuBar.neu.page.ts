import { expect, type Locator, Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/KlasseCreationView.page';
import { KlasseManagementViewPage, KlasseManagementViewPageOptions } from '../admin/organisationen/KlasseManagementView.page';
import { PersonCreationViewPage } from '../admin/personen/PersonCreationView.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.page';
import { SchuleCreationViewPage } from '../admin/organisationen/SchuleCreationView.page';
import { SchuleManagementViewPage } from '../admin/organisationen/SchuleManagementView.page';

export class MenuBarPage {
  /* add global locators here */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /* actions */
  public async goToPersonManagement(): Promise<PersonManagementViewPage> {
    await this.page.getByTestId('person-management-menu-item').click();
    return new PersonManagementViewPage(this.page);
  }

  public async rolleAnlegen(): Promise<RolleCreationViewPage> {
    await this.page.getByTestId('rolle-creation-menu-item').click();
    return new RolleCreationViewPage(this.page);
  }

  public async alleRollenAnzeigen(): Promise<RolleManagementViewPage> {
    await this.page.getByTestId('rolle-management-menu-item').click();
    await this.page.waitForURL('**/admin/rollen');
    return new RolleManagementViewPage(this.page);
  }

  public async alleSchulenAnzeigen(): Promise<SchuleManagementViewPage> {
    await this.page.getByTestId('schule-management-menu-item').click();
    return new SchuleManagementViewPage(this.page);
  }

  public async schuleAnlegen(): Promise<SchuleCreationViewPage> {
    await this.page.getByTestId('schule-creation-menu-item').click();
    return new SchuleCreationViewPage(this.page);
  }

  public async goToBenutzerImport(): Promise<PersonImportViewPage> {
    await this.page.getByTestId('person-import-menu-item').click();
    return new PersonImportViewPage(this.page);
  }

  public async alleKlassenAnzeigen(options?: KlasseManagementViewPageOptions): Promise<KlasseManagementViewPage> {
    await this.page.getByTestId('klassen-management-menu-item').click();
    return new KlasseManagementViewPage(this.page, options);
  }

  public async klasseAnlegen(): Promise<KlasseCreationViewPage> {
    await this.page.getByTestId('klasse-creation-menu-item').click();
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(this.page);
    await expect(klasseCreationView.textH2KlasseAnlegen).toContainText('Neue Klasse hinzufügen');
    return klasseCreationView;
  }

  public async personAnlegen(): Promise<PersonCreationViewPage> {
    await this.page.getByTestId('person-creation-menu-item').click();
    return new PersonCreationViewPage(this.page);
  }

  /* assertions */
}
