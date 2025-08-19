import { expect, type Locator, Page } from '@playwright/test';
import { KlasseCreationViewPage } from '../admin/organisationen/klassen/KlasseCreationView.page';
import { KlasseManagementViewPage, KlasseManagementViewPageOptions } from '../admin/organisationen/klassen/KlasseManagementView.page';
import { PersonCreationViewPage } from '../admin/personen/PersonCreationView.page';
import { PersonImportViewPage } from '../admin/personen/PersonImportView.page';
import { PersonManagementViewPage } from '../admin/personen/PersonManagementView.page';
import { RolleCreationViewPage } from '../admin/rollen/RolleCreationView.page';
import { RolleManagementViewPage } from '../admin/rollen/RolleManagementView.page';
import { SchuleCreationViewPage } from '../admin/organisationen/schulen/SchuleCreationView.page';
import { SchuleManagementViewPage } from '../admin/organisationen/schulen/SchuleManagementView.page';

export class MenuPage {
  readonly page: Page;
  readonly headerLabelNavigation: Locator;
  readonly buttonBackStartpage: Locator;
  readonly labelBenutzerverwaltung: Locator;
  readonly menueItemAlleBenutzerAnzeigen: Locator;
  readonly menueItemBenutzerAnlegen: Locator;
  readonly labelKlassenverwaltung: Locator;
  readonly menueItemAlleKlassenAnzeigen: Locator;
  readonly menueItemKlasseAnlegen: Locator;
  readonly labelRollenverwaltung: Locator;
  readonly menueItemAlleRollenAnzeigen: Locator;
  readonly menueItemRolleAnlegen: Locator;
  readonly labelSchulverwaltung: Locator;
  readonly menueItemAlleSchulenAnzeigen: Locator;
  readonly menueItemSchuleAnlegen: Locator;
  readonly labelSchultraegerverwaltung: Locator;
  readonly menuItemBenutzerImportieren: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerLabelNavigation = page.locator('[data-testid="menu-bar-title"] .v-list-item-title');
    this.buttonBackStartpage = page.getByTestId('back-to-start-link');
    this.labelBenutzerverwaltung = page.locator('[data-testid="person-management-title"] .v-list-item-title');
    this.labelKlassenverwaltung = page.locator('[data-testid="klasse-management-title"] .v-list-item-title');
    this.labelRollenverwaltung = page.locator('[data-testid="rolle-management-title"] .v-list-item-title');
    this.labelSchultraegerverwaltung = page.locator('[data-testid="schultraeger-management-title"] .v-list-item-title');
    this.labelSchulverwaltung = page.locator('[data-testid="schule-management-title"] .v-list-item-title');
    this.menueItemAlleBenutzerAnzeigen = page.getByTestId('person-management-menu-item');
    this.menueItemAlleKlassenAnzeigen = page.getByTestId('klasse-management-menu-item');
    this.menueItemAlleRollenAnzeigen = page.getByTestId('rolle-management-menu-item');
    this.menueItemAlleSchulenAnzeigen = page.getByTestId('schule-management-menu-item');
    this.menueItemBenutzerAnlegen = page.getByTestId('person-creation-menu-item');
    this.menueItemKlasseAnlegen = page.getByTestId('klasse-creation-menu-item');
    this.menueItemRolleAnlegen = page.getByTestId('rolle-creation-menu-item');
    this.menueItemSchuleAnlegen = page.getByTestId('schule-creation-menu-item');
    this.menuItemBenutzerImportieren = page.getByTestId('person-import-menu-item');
  }

  public async alleBenutzerAnzeigen(): Promise<PersonManagementViewPage> {
    await this.menueItemAlleBenutzerAnzeigen.click();
    return new PersonManagementViewPage(this.page);
  }

  public async rolleAnlegen(): Promise<RolleCreationViewPage> {
    await this.menueItemRolleAnlegen.click();
    return new RolleCreationViewPage(this.page);
  }

  public async alleRollenAnzeigen(): Promise<RolleManagementViewPage> {
    await this.menueItemAlleRollenAnzeigen.click();
    await this.page.waitForURL('**/admin/rollen');
    return new RolleManagementViewPage(this.page);
  }

  public async alleSchulenAnzeigen(): Promise<SchuleManagementViewPage> {
    await this.menueItemAlleSchulenAnzeigen.click();
    return new SchuleManagementViewPage(this.page);
  }

  public async schuleAnlegen(): Promise<SchuleCreationViewPage> {
    await this.menueItemSchuleAnlegen.click();
    return new SchuleCreationViewPage(this.page);
  }

  public async goToBenutzerImport(): Promise<PersonImportViewPage> {
    await this.menuItemBenutzerImportieren.click();
    return new PersonImportViewPage(this.page);
  }

  public async alleKlassenAnzeigen(options?: KlasseManagementViewPageOptions): Promise<KlasseManagementViewPage> {
    await this.menueItemAlleKlassenAnzeigen.click();
    return new KlasseManagementViewPage(this.page, options);
  }

  public async klasseAnlegen(): Promise<KlasseCreationViewPage> {
    await this.menueItemKlasseAnlegen.click();
    const klasseCreationView: KlasseCreationViewPage = new KlasseCreationViewPage(this.page);
    await expect(klasseCreationView.textH2KlasseAnlegen).toContainText('Neue Klasse hinzufügen');
    return klasseCreationView;
  }

  public async personAnlegen(): Promise<PersonCreationViewPage> {
    await this.menueItemBenutzerAnlegen.click();
    return new PersonCreationViewPage(this.page);
  }

  public async goToBenutzerAnzeigen(): Promise<PersonManagementViewPage> {
    await this.menueItemAlleBenutzerAnzeigen.click();
    return new PersonManagementViewPage(this.page);
  }
}
