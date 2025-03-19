import { type Locator, Page } from '@playwright/test';
import { PersonImportViewPage } from './admin/PersonImportView.page';
import { RolleCreationViewPage } from './admin/RolleCreationView.page';
import { RolleManagementViewPage } from './admin/RolleManagementView.page';
import { SchuleCreationViewPage } from './admin/SchuleCreationView.page';
import { SchuleManagementViewPage } from './admin/SchuleManagementView.page';
import { KlasseManagementViewPage } from './admin/KlasseManagementView.page';
import { PersonCreationViewPage } from './admin/PersonCreationView.page';

export class MenuPage {
  readonly page: Page;
  readonly header_label_Navigation: Locator;
  readonly button_BackStartpage: Locator;
  readonly label_Benutzerverwaltung: Locator;
  readonly menueItem_AlleBenutzerAnzeigen: Locator;
  readonly menueItem_BenutzerAnlegen: Locator;
  readonly label_Klassenverwaltung: Locator;
  readonly menueItem_AlleKlassenAnzeigen: Locator;
  readonly menueItem_KlasseAnlegen: Locator;
  readonly label_Rollenverwaltung: Locator;
  readonly menueItem_AlleRollenAnzeigen: Locator;
  readonly menueItem_RolleAnlegen: Locator;
  readonly label_Schulverwaltung: Locator;
  readonly menueItem_AlleSchulenAnzeigen: Locator;
  readonly menueItem_SchuleAnlegen: Locator;
  readonly label_Schultraegerverwaltung: Locator;
  readonly menuItem_BenutzerImportieren: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header_label_Navigation = page.locator('[data-testid="menu-bar-title"] .v-list-item-title');
    this.button_BackStartpage = page.getByTestId('back-to-start-link');
    this.label_Benutzerverwaltung = page.locator('[data-testid="person-management-title"] .v-list-item-title');
    this.label_Klassenverwaltung = page.locator('[data-testid="klasse-management-title"] .v-list-item-title');
    this.label_Rollenverwaltung = page.locator('[data-testid="rolle-management-title"] .v-list-item-title');
    this.label_Schultraegerverwaltung = page.locator(
      '[data-testid="schultraeger-management-title"] .v-list-item-title'
    );
    this.label_Schulverwaltung = page.locator('[data-testid="schule-management-title"] .v-list-item-title');
    this.menueItem_AlleBenutzerAnzeigen = page.getByTestId('person-management-menu-item');
    this.menueItem_AlleKlassenAnzeigen = page.getByTestId('klassen-management-menu-item');
    this.menueItem_AlleRollenAnzeigen = page.getByTestId('rolle-management-menu-item');
    this.menueItem_AlleSchulenAnzeigen = page.getByTestId('schule-management-menu-item');
    this.menueItem_BenutzerAnlegen = page.getByTestId('person-creation-menu-item');
    this.menueItem_KlasseAnlegen = page.getByTestId('klasse-creation-menu-item');
    this.menueItem_RolleAnlegen = page.getByTestId('rolle-creation-menu-item');
    this.menueItem_SchuleAnlegen = page.getByTestId('schule-creation-menu-item');
    this.menuItem_BenutzerImportieren = page.getByTestId('person-import-menu-item');
  }

  public async rolleAnlegen(): Promise<RolleCreationViewPage> {
    await this.menueItem_RolleAnlegen.click();
    return new RolleCreationViewPage(this.page);
  }

  public async alleRollenAnzeigen(): Promise<RolleManagementViewPage> {
    await this.menueItem_AlleRollenAnzeigen.click();
    await this.page.waitForURL("**/admin/rollen");
    return new RolleManagementViewPage(this.page);
  }

  public async alleSchulenAnzeigen(): Promise<SchuleManagementViewPage> {
    await this.menueItem_AlleSchulenAnzeigen.click();
    return new SchuleManagementViewPage(this.page);
  }

  public async schuleAnlegen(): Promise<SchuleCreationViewPage> {
    await this.menueItem_SchuleAnlegen.click();
    return new SchuleCreationViewPage(this.page);
  }

  public async goToBenutzerImport(): Promise<PersonImportViewPage> {
    await this.menuItem_BenutzerImportieren.click();
    return new PersonImportViewPage(this.page);
  }

  public async alleKlassenAnzeigen(): Promise<KlasseManagementViewPage> {
    await this.menueItem_AlleKlassenAnzeigen.click();
    return new KlasseManagementViewPage(this.page);
  }

  public async personAnlegen(): Promise<PersonCreationViewPage> {
    await this.menueItem_BenutzerAnlegen.click();
    return new PersonCreationViewPage(this.page);
  }
}
