import { Page } from '@playwright/test';
import { LandingViewPage } from './LandingView.neu.page';

function FromAnywhere(page: Page): { start: () => Promise<LandingViewPage> } {
  return {
    async start(): Promise<LandingViewPage> {
      return page.goto('/').then(() => new LandingViewPage(page));
    },
  };
}

export default FromAnywhere;
