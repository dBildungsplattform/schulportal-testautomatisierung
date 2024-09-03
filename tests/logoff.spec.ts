import { expect, PlaywrightTestArgs, test } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { StartPage } from "../pages/StartView.page";
import { LoginPage } from "../pages/LoginView.page";
import { HeaderPage } from "../pages/Header.page";

const PW: string = process.env["PW"] || "";
const USER: string = process.env["USER"] || "";
const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

test.describe(`Testfälle für die Authentifizierung: Umgebung: ${process.env["UMGEBUNG"]}: URL: ${process.env["FRONTEND_URL"]}:`, () => {
  test("Erfolgreicher Standard Logoff als Landesadmin @long @short @stage", async ({
    page,
  }: PlaywrightTestArgs) => {
    const Landing: LandingPage = new LandingPage(page);
    const Startseite: StartPage = new StartPage(page);
    const Login: LoginPage = new LoginPage(page);
    const Header: HeaderPage = new HeaderPage(page);

    await test.step(`Annmelden mit Benutzer ${USER}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(USER, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });

    await test.step(`Abmelden Benutzer ${USER}`, async () => {
      await Header.button_logout.click();
      await expect(Landing.text_Willkommen).toBeEnabled();
    });
  });
});
