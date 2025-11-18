import { Locator, Page } from "@playwright/test";

export class LandesbedienstetenSearchResultPage {
  /* add global locators here */

  constructor(protected readonly page: Page) {}

  public headline: Locator = this.page.getByRole('heading', { name: 'Suchergebnis' });
  // Persönliche Daten
  public personalDataCard: Locator = this.page.getByTestId('personal-data-card').nth(1);
  public personalDataHeadline: Locator = this.personalDataCard.getByRole('heading', { name: 'Persönliche Daten' });
  public pCardFullname: Locator = this.personalDataCard.getByTestId('fullname-value');
  public pCardUsername: Locator = this.personalDataCard.getByTestId('username-value');
  public pCardKopersnummer: Locator = this.personalDataCard.getByTestId('kopersnummer-value');
  public pCardEmail: Locator = this.personalDataCard.getByTestId('person-email-value');

  // Schulzuordnung
  public zuordnungCard: Locator = this.page.getByTestId('zuordnung-card-1');
  public zuordnungHeadline: Locator = this.zuordnungCard.getByTestId('zuordnung-card-1-headline');
  public zCardOrganisation: Locator = this.zuordnungCard.getByTestId('organisation-value-1');
  public zCardRolle: Locator = this.zuordnungCard.getByTestId('rolle-value-1');
  public zCardDienststellennummer: Locator = this.zuordnungCard.getByTestId('dienststellennummer-value-1');
  // Buttons
  public zurueckZurSucheButton: Locator = this.page.getByTestId('back-to-search-button');
  public landesbedienstetenHinzufuegenButton: Locator = this.page.getByTestId('add-state-employee-button');
}