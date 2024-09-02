import { expect, type Locator, Page } from "@playwright/test";
import generator from "generate-password-ts";

export class LoginPage {
  public readonly input_username: Locator;
  public readonly input_password: Locator;
  public readonly input_NewPassword: Locator;
  public readonly input_ConfirmPW: Locator;
  public readonly button_login: Locator;
  public readonly button_submitPWChange: Locator;
  public readonly text_h1: Locator;
  public readonly text_h1_updatePW: Locator;
  public readonly text_span_inputerror: Locator;

  public constructor(public readonly page: Page) {
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
  }

  public async login(username: string, password: string): Promise<void> {
    await expect(this.text_h1).toBeVisible();
    await this.input_username.click();
    await this.input_username.fill(username);
    await this.input_password.click();
    await this.input_password.fill(password);
    await this.button_login.click();
  }

  public async UpdatePW(): Promise<string> {
    let new_Password: string = "";
    new_Password = generator.generate({ length: 10, numbers: true });
    await expect(this.text_h1_updatePW).toBeVisible();
    await this.input_NewPassword.click();
    await this.input_NewPassword.fill(new_Password);
    await this.input_ConfirmPW.click();
    await this.input_ConfirmPW.fill(new_Password);
    await this.button_submitPWChange.click();
    return new_Password;
  }
}
