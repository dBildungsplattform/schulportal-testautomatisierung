import { expect, Page, PlaywrightTestArgs, test } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { Email4TeacherPage } from "../pages/Cards/Email4Teacher.page";
import { ItsLearningPage } from "../pages/Cards/ItsLearning.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page";
import { HeaderPage } from "../pages/Header.page";

const PW: string = process.env["PW"] || "";
const ADMIN: string = process.env["USER"] || "";
const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

test.describe(`Testfälle für den Test von workflows: Umgebung: ${process.env["UMGEBUNG"]}: URL: ${process.env["FRONTEND_URL"]}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const Landing: LandingPage = new LandingPage(page);
      const Startseite: StartPage = new StartPage(page);
      const Login: LoginPage = new LoginPage(page);

      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Angebote per Link öffnen als Landesadmin @long @short @stage", async ({
    page,
  }: PlaywrightTestArgs) => {
    const Startseite: StartPage = new StartPage(page);

    await test.step(`Kacheln Email für Lehrkräfte und Itslearning öffnen, danach beide Kacheln wieder schließen`, async () => {
      const page_Email4Teacher_Promise: Promise<Page> =
        page.waitForEvent("popup");
      await Startseite.card_item_email.click();
      const page_Email4Teacher: Page = await page_Email4Teacher_Promise;
      const Email4Teacher: Email4TeacherPage = new Email4TeacherPage(
        page_Email4Teacher,
      );
      await expect(Email4Teacher.text_h1).toBeVisible();

      const page_Itslearning_Promise: Promise<Page> =
        page.waitForEvent("popup");
      await Startseite.card_item_itslearning.click();
      const page_Itslearning: Page = await page_Itslearning_Promise;
      const Itslearning: ItsLearningPage = new ItsLearningPage(
        page_Itslearning,
      );
      await expect(Itslearning.text_h1).toBeVisible();

      await page_Itslearning.close();
      await page_Email4Teacher.close();
    });

    await test.step(`Prüfen, dass die Startseite noch geöffnet ist`, async () => {
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test("Passwort Reset für einen Lehrer als Landesadmin @long @short @stage", async ({
    page,
  }: PlaywrightTestArgs) => {
    const Landing: LandingPage = new LandingPage(page);
    const Login: LoginPage = new LoginPage(page);
    const Startseite: StartPage = new StartPage(page);
    const PersonManagement: PersonManagementViewPage =
      new PersonManagementViewPage(page);
    const PersonManagementDetail: PersonDetailsViewPage =
      new PersonDetailsViewPage(page);
    const Header: HeaderPage = new HeaderPage(page);
    const lastname: string = "AutoTester";
    const username: string = "autotester";
    let new_password: string = "";

    await test.step(`Benutzerverwaltung öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
    });

    await test.step(`In der Benutzerverwaltung die Zeile für Benutzer ${lastname} anklicken und User-Details öffnen`, async () => {
      await expect(PersonManagement.text_h2_Benutzerverwaltung).toBeVisible();
      await page.getByRole("cell", { name: lastname, exact: true }).click();
    });

    await test.step(`In den User-Details PW-Reset Dialog starten`, async () => {
      await expect(
        PersonManagementDetail.text_h2_BenutzerBearbeiten,
      ).toBeVisible();
      await PersonManagementDetail.button_pwChange.click();
      await expect(PersonManagementDetail.text_pwResetInfo).toBeVisible();
    });

    await test.step(`In dem overlay den PW-Reset bestätigen, das PW kopieren und Dialog schließen`, async () => {
      await PersonManagementDetail.button_pwReset.click();
      await expect(PersonManagementDetail.text_pwResetInfo).toBeVisible();
      new_password = await PersonManagementDetail.input_pw.inputValue();
      await PersonManagementDetail.button_close_pwreset.click();
    });

    await test.step(`Login für Benutzer ${lastname} mit dem neuen PW`, async () => {
      await Header.button_logout.click();
      await Landing.button_Anmelden.click();
      await Login.login(username, new_password);
    });

    await test.step(`Neues PW vergeben`, async () => {
      await Login.UpdatePW();
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });
});
