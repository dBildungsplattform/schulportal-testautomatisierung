import { expect, type Locator, Page } from "@playwright/test";
import generator from "generate-password-ts";
import { StartPage } from "./StartView.page";

export class LoginPage {
  readonly page: Page;
  readonly input_username: Locator;
  readonly input_password: Locator;
  readonly input_NewPassword: Locator;
  readonly input_ConfirmPW: Locator;
  readonly button_login: Locator;
  readonly button_submitPWChange: Locator;
  readonly text_h1: Locator;
  readonly text_h1_updatePW: Locator;
  readonly text_span_inputerror: Locator;
  readonly text_span_alertBox: Locator;

  constructor(page) {
    this.page = page;
    this.text_h1 = page.getByTestId("login-page-title");
    this.text_h1_updatePW = page.getByTestId("login-page-title");
    this.input_username = page.getByTestId("username-input");
    this.input_password = page.getByTestId("password-input");
    this.input_NewPassword = page.getByTestId("new-password-input");
    this.input_ConfirmPW = page.getByTestId("new-password-confirm-input");
    this.button_login = page.getByTestId("login-button");
    this.button_submitPWChange = page.getByTestId("set-password-button");
    this.text_span_inputerror = page.getByText(
      "Ungültiger Benutzername oder Passwort",
    );
    this.text_span_alertBox = page.locator('.pf-c-alert__title');
  }

  async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string,
  ): Promise<StartPage> {
    await expect(this.text_h1).toBeVisible();
    await this.input_username.click();
    await this.input_username.fill(username);
    await this.input_password.click();
    await this.input_password.fill(password);
    await this.button_login.click();
    // BE requests laufen zeitverzögert zum FE; dieses muss im FE behoben werden; solange dies nicht der Fall ist, brauchen wir diesen workaround
    // Wenn auf login/logout geklickt wird, sind teilweise noch requests am laufen
    await this.page.waitForTimeout(1000);  // Im ticket SPSH-1738 muss dieser workaroundt durch einen waitForResponse oder Ähnlichem ersetzt werden

    return new StartPage(this.page);
  }

  async UpdatePW() {
    const new_Password = generator.generate({ length: 8, numbers: true }) + '1Aa!';
    await expect(this.text_h1_updatePW).toBeVisible();
    await this.input_NewPassword.click();
    await this.input_NewPassword.fill(new_Password);
    await this.input_ConfirmPW.click();
    await this.input_ConfirmPW.fill(new_Password);
    await this.button_submitPWChange.click();
    return new_Password;
  }
}
