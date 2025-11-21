import { expect, Locator, Page } from "@playwright/test";
import { LandesbedienstetenSearchFormPage } from "./LandesbedienstetenSearchForm.page";
import { PersonDetailsViewPage } from "../details/PersonDetailsView.neu.page";
import { PersonManagementViewPage } from "../PersonManagementView.neu.page";
   
export class LandesbedienstetenSuccessPage {
      
  constructor(protected readonly page: Page) {}

    private readonly headline: Locator = this.page.getByTestId('admin-headline');
    private readonly cardHeadline: Locator = this.page.getByTestId('add-state-employee-headline');
    private readonly closeButton: Locator = this.page.getByTestId('close-layout-card-button');

    private readonly successText: Locator = this.page.getByTestId('state-employee-success-text');
    private readonly successIcon: Locator = this.page.getByTestId('state-employee-success-icon');

    // Hinweistext „Folgende Daten wurden gespeichert:“
    private readonly followingDataText: Locator = this.page.getByTestId('following-data-added-text');

    // Einzelne Datenfelder
    private readonly vornameLabel: Locator = this.page.getByTestId('added-state-employee-vorname-label');
    private readonly vorname: Locator = this.page.getByTestId('added-state-employee-vorname');
    private readonly familiennameLabel: Locator = this.page.getByTestId('added-state-employee-familienname-label');
    private readonly familienname: Locator = this.page.getByTestId('added-state-employee-familienname');
    private readonly personalnummerLabel: Locator = this.page.getByTestId('added-state-employee-personalnummer-label');
    private readonly personalnummer: Locator = this.page.getByTestId('added-state-employee-personalnummer');
    private readonly usernameLabel: Locator = this.page.getByTestId('added-state-employee-username-label');
    private readonly username: Locator = this.page.getByTestId('added-state-employee-username');
    private readonly organisationLabel: Locator = this.page.getByTestId('added-state-employee-organisation-label');
    private readonly organisation: Locator = this.page.getByTestId('added-state-employee-organisation');
    private readonly rolleLabel: Locator = this.page.getByTestId('added-state-employee-rolle-label');
    private readonly rolle: Locator = this.page.getByTestId('added-state-employee-rolle');
    private readonly befristungLabel: Locator = this.page.getByTestId('added-state-employee-befristung-label');
    private readonly befristung: Locator = this.page.getByTestId('added-state-employee-befristung');

    private readonly goToDetailsButton: Locator = this.page.getByTestId('go-to-details-button');
    private readonly backToListButton: Locator = this.page.getByTestId('back-to-list-button');
    private readonly searchAnotherButton: Locator = this.page.getByTestId('search-another-state-employee-button');

    /* Actions */

    public async waitForPageLoad(): Promise<void> {
      await expect(this.followingDataText).toBeVisible();
    }
    
    public async clickGoToDetails(): Promise<PersonDetailsViewPage> {
      await this.goToDetailsButton.click();
      const personDetailsViewPage: PersonDetailsViewPage = new PersonDetailsViewPage(this.page);
      await personDetailsViewPage.waitForPageLoad();
      await expect(this.headline).toBeHidden();
      return personDetailsViewPage;
    }
  
    public async clickBackToList(): Promise<PersonManagementViewPage> {
      await this.backToListButton.click();
      const personManagementViewPage: PersonManagementViewPage = new PersonManagementViewPage(this.page);
      await personManagementViewPage.waitForPageLoad();
      await expect(this.headline).toBeHidden();
      return personManagementViewPage;
    }
  
    public async clickSearchAnother(): Promise<LandesbedienstetenSearchFormPage> {
      await this.searchAnotherButton.click();
      const landesbedienstetenSearchFormPage: LandesbedienstetenSearchFormPage = new LandesbedienstetenSearchFormPage(this.page);
      await landesbedienstetenSearchFormPage.waitForPageLoad();
      await expect(this.headline).toBeHidden();
      return landesbedienstetenSearchFormPage;
    }
    
    public async assertAllElementsVisible(landesbedienstetenFullname: string, befristung?: string): Promise<void> {
      await expect(this.headline).toBeVisible();
      await expect(this.headline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
      await expect(this.cardHeadline).toBeVisible();
      await expect(this.cardHeadline).toHaveText('Landesbediensteten hinzufügen');
      await expect(this.closeButton).toBeVisible();
      await expect(this.successText).toBeVisible();
      await expect(this.successText).toHaveText(`${landesbedienstetenFullname} wurde erfolgreich hinzugefügt.`);
      await expect(this.successIcon).toBeVisible();
      await expect(this.followingDataText).toBeVisible();
      await expect(this.followingDataText).toHaveText('Folgende Daten wurden gespeichert:');
      //Persönliche Daten
      await expect(this.vornameLabel).toBeVisible();
      await expect(this.vorname).toBeVisible();
      await expect(this.familiennameLabel).toBeVisible();
      await expect(this.familienname).toBeVisible();
      await expect(this.personalnummerLabel).toBeVisible();
      await expect(this.personalnummer).toBeVisible();
      await expect(this.usernameLabel).toBeVisible();
      await expect(this.username).toBeVisible();
      await expect(this.organisationLabel).toBeVisible();
      await expect(this.organisation).toBeVisible();
      await expect(this.rolleLabel).toBeVisible();
      await expect(this.rolle).toBeVisible();
      //Befristung
      await expect(this.befristungLabel).toBeVisible();
      await expect(this.befristung).toBeVisible();
      const befristungText : string = befristung ?? 'unbefristet';
      await expect(this.befristung).toHaveText(befristungText);
      //Buttons
      await expect(this.goToDetailsButton).toBeVisible();
      await expect(this.backToListButton).toBeVisible();
      await expect(this.searchAnotherButton).toBeVisible();
      await expect(this.goToDetailsButton).toBeEnabled();
      await expect(this.backToListButton).toBeEnabled();
      await expect(this.searchAnotherButton).toBeEnabled();
      await expect(this.goToDetailsButton).toHaveText('Zur Gesamtübersicht');
      await expect(this.backToListButton).toHaveText('Zurück zur Ergebnisliste');
      await expect(this.searchAnotherButton).toHaveText('Weiteren Landesbediensteten suchen');
    }
}