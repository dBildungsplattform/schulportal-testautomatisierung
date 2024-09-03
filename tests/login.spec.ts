import { expect, PlaywrightTestArgs, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginView.page";
import { LandingPage } from "../pages/LandingView.page";
import { StartPage } from "../pages/StartView.page";
import { HeaderPage } from "../pages/Header.page";

const PW: string = process.env["PW"] || "";
const USER: string = process.env["USER"] || "";
const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env["UMGEBUNG"]}: URL: ${process.env["FRONTEND_URL"]}:`, () => {
  test("Erfolgreicher Standard Login Landesadmin @long @stage @smoke", async ({
    page,
  }: PlaywrightTestArgs) => {
    const Login: LoginPage = new LoginPage(page);
    const Landing: LandingPage = new LandingPage(page, FRONTEND_URL);
    const Start: StartPage = new StartPage(page);
    const Header: HeaderPage = new HeaderPage(page);

    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await Landing.goto();
      await Landing.login();
      await Login.login(USER, PW);
      await expect(Start.text_h2_Ueberschrift).toBeVisible();
      await Header.logout();
    });
  });

  test("Erfolgloser Login mit falschem Passwort", async ({
    page: page,
  }: PlaywrightTestArgs) => {
    const Login: LoginPage = new LoginPage(page);
    const Landing: LandingPage = new LandingPage(page, FRONTEND_URL);

    await test.step(`Anmelden mit Benutzer ${USER}`, async () => {
      await Landing.login();
      await Login.login(USER, "Mickeymouse");

      await expect(Login.text_span_inputerror).toBeVisible();
      await expect(Login.text_h1).toBeVisible();
    });
  });
});
