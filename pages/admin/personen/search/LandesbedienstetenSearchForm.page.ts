import { expect, Locator, Page } from "@playwright/test";
import { SearchResultErrorDialog } from '../../../components/SearchResultErrorDialog';
import { LandesbedienstetenSearchResultPage } from './LandesbedienstetenSearchResult.page';

export class LandesbedienstetenSearchFormPage {
  constructor(protected readonly page: Page) {}
  /* add global locators here */
  private readonly headline: Locator = this.page.getByTestId('admin-headline');
  private readonly searchCardHeadline: Locator = this.page.getByTestId('search-state-employee-headline');
  
  /* Landesbediensteten Suchen  */
  private readonly kopersRadioInput : Locator = this.page.getByTestId('kopers-radio-button').locator('input');
  private readonly emailRadioInput : Locator = this.page.getByTestId('email-radio-button').locator('input');
  private readonly usernameRadioInput : Locator = this.page.getByTestId('username-radio-button').locator('input');
  private readonly nameRadioInput : Locator = this.page.getByTestId('name-radio-button').locator('input');
  private readonly kopersInput : Locator = this.page.getByTestId('kopers-input').locator('input');
  private readonly emailInput : Locator = this.page.getByTestId('email-input').locator('input');
  private readonly usernameInput : Locator = this.page.getByTestId('username-input').locator('input');
  private readonly vornameInput : Locator = this.page.getByTestId('vorname-input').locator('input');
  private readonly nachnameInput : Locator = this.page.getByTestId('nachname-input').locator('input');
  /* the reset search button's id is not properly named due to automated name generation in forms,
     and a different usage of that button in the search form */
  private readonly zuruecksetzenButton : Locator = this.page.getByTestId('person-search-form-discard-button');
  private readonly landesbedienstetenSuchenButton : Locator = this.page.getByTestId('person-search-form-submit-button');

  private readonly searchResultErrorDialogKeineTrefferText: string = "Es wurde leider kein Treffer gefunden. Bitte prüfen Sie Ihre Eingabe. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.";
  private readonly searchResultErrorDialogDoppelteTrefferText: string = "Es wurde mehr als ein Treffer gefunden. Bitte verwenden Sie zur Suche die KoPers.-Nr., die Landes-Mailadresse oder den Benutzernamen. Sollten Sie Hilfe benötigen, eröffnen Sie ein Störungsticket über den IQSH-Helpdesk.";

  /* actions */
  public async waitForPageLoad(): Promise<LandesbedienstetenSearchFormPage> {
    await expect(this.headline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await this.searchCardHeadline.waitFor({ state: 'visible' });
    await expect(this.searchCardHeadline).toHaveText('Landesbediensteten suchen');
    return this;
  }

  public async fillKopersNr(kopersNr: string): Promise<void> {
    if (!(await this.kopersRadioInput.isChecked())) {
      await this.kopersRadioInput.check();
    }
    await this.kopersInput.fill(kopersNr);
  }

  public async fillEmail(email: string): Promise<void> {
    if (!(await this.emailRadioInput.isChecked())) {
      await this.emailRadioInput.check();
    }
    await this.emailInput.fill(email);
  }

  public async fillBenutzername(benutzername: string): Promise<void> {
    if (!(await this.usernameRadioInput.isChecked())) {
      await this.usernameRadioInput.check();
    }
    await this.usernameInput.fill(benutzername);
  }

  public async fillVornameNachname(vorname: string, nachname: string): Promise<void> {
    if (!(await this.nameRadioInput.isChecked())) {
      await this.nameRadioInput.check();
    }
    await this.vornameInput.fill(vorname);
    await this.nachnameInput.fill(nachname);
  }

  public async checkMandatoryFieldsForNameSearch(vorname: string, nachname: string): Promise<void> {
    await this.fillVornameNachname(vorname, nachname);
    await this.clickLandesbedienstetenSuchen();
    if (vorname === '') {
      await expect(this.page.getByTestId('vorname-input').locator('.v-messages__message')).toHaveText('Der Vorname ist erforderlich.');
    }
    if (nachname === '') {
      await expect(this.page.getByTestId('nachname-input').locator('.v-messages__message')).toHaveText('Der Nachname ist erforderlich.');
    }
  }

  public async clickLandesbedienstetenSuchen(): Promise<void> {
    await this.landesbedienstetenSuchenButton.click();
  }

  public async clickLandesbedienstetenSuchenWithduplicateName(vorname: string, nachname: string): Promise<SearchResultErrorDialog> {
    await this.fillVornameNachname(vorname, nachname);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'), this.searchResultErrorDialogDoppelteTrefferText);
  }

  public async clickLandesbedienstetenSuchenWithInvalidName(vorname: string, nachname: string): Promise<SearchResultErrorDialog> {
    await this.fillVornameNachname(vorname, nachname);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'), this.searchResultErrorDialogKeineTrefferText);
  }

  public async clickLandesbedienstetenSuchenWithInvalidKoPers(kopers: string): Promise<SearchResultErrorDialog> {
    await this.fillKopersNr(kopers);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'), this.searchResultErrorDialogKeineTrefferText);
  }

  public async clickLandesbedienstetenSuchenWithInvalidMail(eMail: string): Promise<SearchResultErrorDialog> {
    await this.fillEmail(eMail);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'), this.searchResultErrorDialogKeineTrefferText);
  }

  public async clickLandesbedienstetenSuchenWithInvalidBenutzername(benutzername: string): Promise<SearchResultErrorDialog> {
    await this.fillBenutzername(benutzername);
    await this.landesbedienstetenSuchenButton.click();
    return new SearchResultErrorDialog(this.page, this.page.getByTestId('person-search-error-dialog'), this.searchResultErrorDialogKeineTrefferText);
  }

  public async searchLandesbedienstetenViaKopers(kopers: string): Promise<LandesbedienstetenSearchResultPage> {
    await this.fillKopersNr(kopers);
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage = new LandesbedienstetenSearchResultPage(this.page);
    await this.clickLandesbedienstetenSuchen();
    return landesbedienstetenSearchResultPage;
  }

  public async searchLandesbedienstetenViaEmail(email: string): Promise<LandesbedienstetenSearchResultPage> {
    await this.fillEmail(email);
    await this.clickLandesbedienstetenSuchen();
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage = new LandesbedienstetenSearchResultPage(this.page);
    return landesbedienstetenSearchResultPage;
  }

  public async searchLandesbedienstetenViaUsername(benutzername: string): Promise<LandesbedienstetenSearchResultPage> {
    await this.fillBenutzername(benutzername);
    await this.clickLandesbedienstetenSuchen();
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage = new LandesbedienstetenSearchResultPage(this.page);
    return landesbedienstetenSearchResultPage;
  }

  public async searchLandesbedienstetenViaName(vorname: string, nachname: string): Promise<LandesbedienstetenSearchResultPage> {
    await this.fillVornameNachname(vorname, nachname);
    await this.clickLandesbedienstetenSuchen();
    const landesbedienstetenSearchResultPage: LandesbedienstetenSearchResultPage = new LandesbedienstetenSearchResultPage(this.page);
    return landesbedienstetenSearchResultPage;
  }

  public async testZuruecksetzenButtonAlleSuchtypen(): Promise<void> {
    interface ResetTestCase {
      fill: () => Promise<void> | void;
      expect: () => Promise<void> | void;
    }
    const testCases: ResetTestCase[] = [
      { fill: () => this.fillKopersNr('123456'), expect: () => expect(this.kopersInput).toBeEmpty() },
      { fill: () => this.fillEmail('test@example.com'), expect: () => expect(this.emailInput).toBeEmpty() },
      { fill: () => this.fillBenutzername('testuser'), expect: () => expect(this.usernameInput).toBeEmpty() },
      { fill: () => this.fillVornameNachname('Max', 'Mustermann'), expect: async (): Promise<void> => {
          await expect(this.vornameInput).toBeEmpty();
          await expect(this.nachnameInput).toBeEmpty();
        }
      }
    ];
    for (const test of testCases) {
      await test.fill();
      await this.zuruecksetzenButton.click();
      await test.expect();
    }
  }

  /* assertions */
  public async checkSearchForm(): Promise<void> {
    await expect(this.headline).toHaveText('Landesbediensteten (suchen und hinzufügen)');
    await expect(this.page.getByTestId('search-state-employee-headline')).toHaveText('Landesbediensteten suchen');
    await expect(this.page.getByTestId('close-layout-card-button')).toBeVisible();
    await expect(this.page.getByText('Bitte wählen Sie, wie Sie nach dem Landesbediensteten suchen möchten.', { exact: false })).toBeVisible();
    await expect(this.kopersRadioInput).toBeChecked();
    await expect(this.kopersInput).toBeVisible();
    await expect(this.emailRadioInput).toBeVisible();
    await expect(this.emailInput).toBeHidden();
    await expect(this.usernameRadioInput).toBeVisible();
    await expect(this.usernameInput).toBeHidden();
    await expect(this.nameRadioInput).toBeVisible();
    await expect(this.vornameInput).toBeHidden();
    await expect(this.nachnameInput).toBeHidden();
    await expect(this.zuruecksetzenButton).toBeEnabled();
    await expect(this.landesbedienstetenSuchenButton).toBeDisabled();
  }

  public async checkNameRadioIsChecked(): Promise<void> {
    await expect(this.nameRadioInput).toBeChecked();
  }

  public async expectKopersRadioChecked(): Promise<void> {
    await expect(this.kopersRadioInput).toBeChecked();
  }

  public async expectEmailRadioChecked(): Promise<void> {
    await expect(this.emailRadioInput).toBeChecked();
  }

  public async expectUsernameRadioChecked(): Promise<void> {
    await expect(this.usernameRadioInput).toBeChecked();
  }

  public async expectNameRadioChecked(): Promise<void> {
    await expect(this.nameRadioInput).toBeChecked();
  }
  public async expectKopersInputValue(value: string): Promise<void> {
    await expect(this.kopersInput).toHaveValue(value);
  }

  public async expectEmailInputValue(value: string): Promise<void> {
    await expect(this.emailInput).toHaveValue(value);
  }

  public async expectUsernameInputValue(value: string): Promise<void> {
    await expect(this.usernameInput).toHaveValue(value);
  }

  public async expectNameInputValues(vorname: string, nachname: string): Promise<void> {
    await expect(this.vornameInput).toHaveValue(vorname);
    await expect(this.nachnameInput).toHaveValue(nachname);
  }
}