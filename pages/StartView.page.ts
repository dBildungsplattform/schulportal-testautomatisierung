import { expect, type Locator, Page, Response } from '@playwright/test';
import { PersonManagementViewPage } from './admin/personen/PersonManagementView.page';
import { LandingPage } from './LandingView.page';
import { MenuPage } from './components/MenuBar.page';
import { schulportaladmin } from '../base/sp';

export class StartPage {
  readonly page: Page;
  readonly textH2Ueberschrift: Locator;
  readonly cardItemEmail: Locator;
  readonly cardItemKalender: Locator;
  readonly cardItemAdressbuch: Locator;
  readonly cardItemItslearning: Locator;
  readonly cardItemSchulportalAdministration: Locator;
  readonly cardItem: (spName: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.textH2Ueberschrift = page.getByTestId('all-service-provider-title');
    this.cardItemEmail = page.locator('[data-testid^="service-provider-card"]', { hasText: 'E-Mail' });
    this.cardItemKalender = page.locator('[data-testid^="service-provider-card"]', { hasText: 'Kalender' });
    this.cardItemAdressbuch = page.locator('[data-testid^="service-provider-card"]', { hasText: 'Adressbuch' });
    this.cardItemItslearning = page.locator('[data-testid^="service-provider-card"]', { hasText: 'itslearning' });
    this.cardItemSchulportalAdministration = page.locator('[data-testid^="service-provider-card"]', {
      hasText: 'Schulportal-Administration',
    });
    this.cardItem = (spName: string): Locator => page.locator('[data-testid^="service-provider-card"]', { hasText: spName });
  }

  public async goToAdministration(): Promise<MenuPage> {
    await this.checkSpIsVisible([schulportaladmin]);
    await this.cardItemSchulportalAdministration.click();
    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(this.page);
    await personManagementView.waitForData();
    return new MenuPage(this.page);
  }

  public async start(): Promise<LandingPage> {
    await this.page.goto(process.env.FRONTEND_URL || '/');
    return new LandingPage(this.page);
  }

  public async validateStartPageIsLoaded(): Promise<StartPage> {
    await this.page.waitForResponse((resp: Response) => resp.url().includes('/api/provider') && resp.status() === 200);
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.textH2Ueberschrift).toBeVisible();
    return new StartPage(this.page);
  }

  public async checkSpIsVisible(spNames: string[]): Promise<void> {
    for (const spName of spNames) {
      await expect(this.cardItem(spName)).toBeVisible();
      await expect(this.cardItem(spName).locator('img')).toBeVisible();
    }
  }

  public async checkSpIsHidden(spNames: string[]): Promise<void> {
    for (const spName of spNames) {
      await expect(this.cardItem(spName)).toBeHidden();
    }
  }
}
