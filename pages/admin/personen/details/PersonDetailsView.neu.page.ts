import { Page } from "@playwright/test";
import { AbstractAdminPage } from "../../../AbstractAdminPage.page";

export class PersonDetailsViewPage extends AbstractAdminPage {
    public constructor(page: Page) {
        super(page);
    }

    public async waitForPageLoad(): Promise<void> {
    }
}