import { type Locator, Page } from "@playwright/test";
import { RolleCreationViewPage } from "./admin/RolleCreationView.page";
import {RolleManagementViewPage} from "./admin/RolleManagementView.page";

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

  constructor(page) {
    this.page = page;
    this.header_label_Navigation = page.locator(
      '[data-testid="menu-bar-title"] .v-list-item-title',
    );
    this.button_BackStartpage = page.getByTestId("back-to-start-link");
    this.label_Benutzerverwaltung = page.locator(
      '[data-testid="person-management-title"] .v-list-item-title',
    );
    this.menueItem_AlleBenutzerAnzeigen = page.getByTestId(
      "person-management-menu-item",
    );
    this.menueItem_BenutzerAnlegen = page.getByTestId(
      "person-creation-menu-item",
    );
    this.label_Klassenverwaltung = page.locator(
      '[data-testid="klasse-management-title"] .v-list-item-title',
    );
    this.menueItem_AlleKlassenAnzeigen = page.getByTestId(
      "klassen-management-menu-item",
    );
    this.menueItem_KlasseAnlegen = page.getByTestId(
      "klasse-creation-menu-item",
    );
    this.label_Rollenverwaltung = page.locator(
      '[data-testid="rolle-management-title"] .v-list-item-title',
    );
    this.menueItem_AlleRollenAnzeigen = page.locator(
      '[data-testid="rolle-management-menu-item"] .v-list-item-title',
    );
    this.menueItem_RolleAnlegen = page.getByTestId("rolle-creation-menu-item");
    this.label_Schulverwaltung = page.locator(
      '[data-testid="schule-management-title"] .v-list-item-title',
    );
    this.menueItem_AlleSchulenAnzeigen = page.locator(
      '[data-testid="schule-management-menu-item"] .v-list-item-title',
    );
    this.menueItem_SchuleAnlegen = page.getByTestId(
      "schule-creation-menu-item",
    );
    this.label_Schultraegerverwaltung = page.locator(
      '[data-testid="schultraeger-management-title"] .v-list-item-title',
    );
  }

  public async rolleAnlegen(): Promise<RolleCreationViewPage> {
    await this.menueItem_RolleAnlegen.click();
    return new RolleCreationViewPage(this.page);
  }

  public async alleRollenAnzeigen(): Promise<RolleManagementViewPage> {
    await this.menueItem_AlleRollenAnzeigen.click();
    return new RolleManagementViewPage(this.page);
  }
}
