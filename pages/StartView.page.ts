import { type Locator, Page } from '@playwright/test';
import { MenuPage } from './MenuBar.page';
import { LandingPage } from './LandingView.page';
import { expect } from '@playwright/test';

export class StartPage {
  readonly page: Page;
  readonly textH2Ueberschrift: Locator;
  readonly cardItemEmail: Locator;
  readonly cardItemKalender: Locator;
  readonly cardItemAdressbuch: Locator;
  readonly cardItemItslearning: Locator;
  readonly cardItemSchulportalAdministration: Locator;
  readonly cardItem: (spName: string) => Locator;

  constructor(page) {
    this.page = page;
    this.textH2Ueberschrift = page.getByTestId('all-service-provider-title');
    this.cardItemEmail = page.locator('[data-testid^="service-provider-card"]', { hasText: 'E-Mail' });
    this.cardItemKalender = page.locator('[data-testid^="service-provider-card"]', { hasText: 'Kalender' });
    this.cardItemAdressbuch = page.locator('[data-testid^="service-provider-card"]', { hasText: 'Adressbuch' });
    this.cardItemItslearning = page.locator('[data-testid^="service-provider-card"]', { hasText: 'itslearning' });
    this.cardItemSchulportalAdministration = page.locator('[data-testid^="service-provider-card"]', {
      hasText: 'Schulportal-Administration',
    });
    this.cardItem = (spName: string) => page.locator('[data-testid^="service-provider-card"]', { hasText: spName });
  }

  public async goToAdministration(): Promise<MenuPage> {
    await this.cardItemSchulportalAdministration.click();
    return new MenuPage(this.page);
  }

  public async start(): Promise<LandingPage> {
    await this.page.goto(process.env.FRONTEND_URL || '/');
    return new LandingPage(this.page);
  }

  public async validateStartPageIsLoaded(): Promise<StartPage> {
    await this.page.waitForResponse((resp) => resp.url().includes('/api/provider') && resp.status() === 200);
    await this.page.waitForResponse('/api/provider/**/logo');
    await expect(this.textH2Ueberschrift).toBeVisible();
    return new StartPage(this.page);
  }

  public async checkSpIsVisible(spNames: string[]) {
    for (const spName of spNames) {
      await expect(this.cardItem(spName)).toBeVisible();
    }
  }
}
