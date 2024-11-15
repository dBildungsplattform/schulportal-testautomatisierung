import { Page } from "@playwright/test";
import { LandingPage } from "./LandingView.page";

function FromAnywhere(page: Page) {
  return {
    async start(): Promise<LandingPage> {
      return page
        .goto(process.env.FRONTEND_URL as string)
        .then(() => new LandingPage(page));
    },
  };
}

export default FromAnywhere;
