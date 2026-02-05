import { Page } from '@playwright/test';
import { LandingViewPage } from './LandingView.neu.page';

function FromAnywhere(page: Page): { start: () => Promise<LandingViewPage> } {
  return {
    async start(): Promise<LandingViewPage> {
      await page.goto('/', { waitUntil: 'load' });
      try {
        const landingPage: LandingViewPage = await new LandingViewPage(page).waitForPageLoad();
        return landingPage;
      } catch (error) {
        console.log('Reloading page due to error in loading landing page:', error);
        await page.reload();
        return new LandingViewPage(page).waitForPageLoad();
      }
    },
  };
}

export default FromAnywhere;
