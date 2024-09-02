import { type Locator, Page } from "@playwright/test";

export class PersonDetailsViewPage {
  public readonly text_h2_BenutzerBearbeiten: Locator;
  public readonly button_pwChange: Locator;
  public readonly button_pwReset: Locator;
  public readonly text_pwResetInfo: Locator;
  public readonly icon_pwVisible: Locator;
  public readonly input_pw: Locator;
  public readonly button_close_pwreset: Locator;

  public constructor(public page: Page) {
    this.text_h2_BenutzerBearbeiten = page.getByTestId("layout-card-headline");
    this.button_pwChange = page.getByTestId("open-password-reset-dialog-icon");
    this.button_pwReset = page.getByTestId("password-reset-button");
    this.text_pwResetInfo = page.getByTestId("password-reset-info-text");
    this.icon_pwVisible = page.getByTestId("show-password-icon");
    this.input_pw = page.locator('[data-testid="password-output-field"] input');
    this.button_close_pwreset = page.getByTestId(
      "close-password-reset-dialog-button",
    );
  }
}
