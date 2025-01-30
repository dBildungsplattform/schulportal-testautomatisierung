import { Page } from "@playwright/test";
import { LandingPage } from "./LandingView.page";

function FromAnywhere(page: Page) {
  return {
    async start(): Promise<LandingPage> {
      return page
        .goto('/', { timeout: 30000 })
        .then(() => new LandingPage(page));
    },
  };
}

export default FromAnywhere;
