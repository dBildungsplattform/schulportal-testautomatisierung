import { Page } from '@playwright/test';
import { LandingPage } from './LandingView.page';

function FromAnywhere(page: Page): { start: () => Promise<LandingPage> } {
  return {
    async start(): Promise<LandingPage> {
      return page.goto('/').then(() => new LandingPage(page));
    },
  };
}

export default FromAnywhere;
