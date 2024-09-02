import { type Locator, Page } from "@playwright/test";

export class AdminMenuPage {
  public readonly header_label_Navigation: Locator;
  public readonly button_BackStartpage: Locator;
  public readonly label_Benutzerverwaltung: Locator;
  public readonly menueItem_AlleBenutzerAnzeigen: Locator;
  public readonly menueItem_BenutzerAnlegen: Locator;
  public readonly label_Klassenverwaltung: Locator;
  public readonly menueItem_AlleKlassenAnzeigen: Locator;
  public readonly menueItem_KlasseAnlegen: Locator;
  public readonly label_Rollenverwaltung: Locator;
  public readonly menueItem_AlleRollenAnzeigen: Locator;
  public readonly menueItem_RolleAnlegen: Locator;
  public readonly label_Schulverwaltung: Locator;
  public readonly menueItem_AlleSchulenAnzeigen: Locator;
  public readonly menueItem_SchuleAnlegen: Locator;
  public readonly label_Schultraegerverwaltung: Locator;

  public constructor(public readonly page: Page) {
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

  public async rolleAnlegen(): Promise<void> {
    await this.menueItem_RolleAnlegen.click();
  }
}
