import { Page } from "@playwright/test";
import { LandingPage } from "./LandingView.page";

function FromAnywhere(page: Page) {
  return {
    async start(): Promise<LandingPage> {
      return page
        .goto(process.env.FRONTEND_URL)
        .then(() => new LandingPage(page));
    },
  };
}

export default FromAnywhere;
