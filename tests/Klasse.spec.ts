import { expect, PlaywrightTestArgs, test } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { LoginPage } from "../pages/LoginView.page";
import { StartPage } from "../pages/StartView.page";
import { AdminMenuPage } from "../pages/MenuBar.page";
import { KlasseCreationViewPage } from "../pages/admin/KlasseCreationView.page";
import { KlasseManagementViewPage } from "../pages/admin/KlasseManagementView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import {
  deleteKlasse,
  getKlasseId,
} from "../base/api/testHelperOrganisation.page";

const PW: string = process.env["PW"] || "";
const ADMIN: string = process.env["USER"] || "";

test.describe(`Testfälle für die Administration von Klassen: Umgebung: ${process.env["UMGEBUNG"]}: URL: ${process.env["FRONTEND_URL"]}:`, () => {
  test.beforeEach(async ({ page: page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const Landing: LandingPage = new LandingPage(page);
      const Startseite: StartPage = new StartPage(page);
      const Login: LoginPage = new LoginPage(page);

      await Landing.login();
      await Login.login(ADMIN, PW);
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    });
  });

  test.afterEach(async ({ page: page }: PlaywrightTestArgs) => {
    await test.step(`Abmelden`, async () => {
      const Header: HeaderPage = new HeaderPage(page);
      await Header.button_logout.click();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Klasse anschließend in der Ergebnisliste suchen und dann löschen @long @short @stage", async ({
    page: page,
  }: PlaywrightTestArgs) => {
    const Startseite: StartPage = new StartPage(page);
    const Menue: AdminMenuPage = new AdminMenuPage(page);
    const KlasseCreationView: KlasseCreationViewPage =
      new KlasseCreationViewPage(page);
    const KlasseManagementView: KlasseManagementViewPage =
      new KlasseManagementViewPage(page);
    const SCHULNAME: string = "Testschule Schulportal";
    const KLASSENNAME: string =
      "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 } });

    await test.step(`Dialog Schule anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_KlasseAnlegen.click();
      await expect(KlasseCreationView.text_h2_KlasseAnlegen).toHaveText(
        "Neue Klasse hinzufügen",
      );
    });

    await test.step(`Klasse anlegen`, async () => {
      await KlasseCreationView.selectSchule(SCHULNAME)
      await KlasseCreationView.input_Klassenname.fill(KLASSENNAME);
      await KlasseCreationView.button_KlasseAnlegen.click();
      await expect(KlasseCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die neue Klasse angezeigt wird`, async () => {
      await Menue.menueItem_AlleKlassenAnzeigen.click();
      await KlasseManagementView.combobox_Filter_Schule.fill(SCHULNAME);
      await page.keyboard.press("ArrowDown", { delay: 300 }); // Wenn die Umgebung zu schnell ist, werden Tastaturbefehle manchmal verschluckt
      await page.keyboard.press("Enter", { delay: 300 });
      await KlasseManagementView.text_h2_Klassenverwaltung.click(); // dies schließt das Dropdown Klasse
      await expect(page.getByRole("cell", { name: KLASSENNAME })).toBeVisible();
    });

    await test.step(`Klasse löschen`, async () => {
      await page.getByRole("cell", { name: KLASSENNAME }).click();
      await page.getByTestId("open-klasse-delete-dialog-button").click();
      await page.getByTestId("klasse-delete-button").click();
      await page
        .getByTestId("close-klasse-delete-success-dialog-button")
        .click();
    });
  });

  test("Ergebnisliste Klassen als Landesadmin auf Vollständigkeit prüfen @long @short @stage", async ({
    page,
  }: PlaywrightTestArgs) => {
    const Startseite: StartPage = new StartPage(page);
    const Menue: AdminMenuPage = new AdminMenuPage(page);
    const KlasseManagementView: KlasseManagementViewPage =
      new KlasseManagementViewPage(page);

    await test.step(`Klassenverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_AlleKlassenAnzeigen.click();
      await expect(
        KlasseManagementView.text_h1_Administrationsbereich,
      ).toBeVisible();
      await expect(KlasseManagementView.text_h2_Klassenverwaltung).toHaveText(
        "Klassenverwaltung",
      );
      await expect(KlasseManagementView.combobox_Filter_Schule).toBeVisible();
      await expect(KlasseManagementView.combobox_Filter_Klasse).toBeVisible();
      await expect(
        KlasseManagementView.table_header_Dienststellennummer,
      ).toBeVisible();
      await expect(KlasseManagementView.table_header_Klassenname).toBeVisible();
    });
  });

  test("Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen @long @stage", async ({
    page,
  }: PlaywrightTestArgs) => {
    const KlasseCreationView: KlasseCreationViewPage =
      new KlasseCreationViewPage(page);
    const DIENSTSTELLENNUMMER: string = "1111111";
    const SCHULNAME: string = "Testschule Schulportal";
    const KLASSENNAME: string =
      "TAuto-PW-K-12 " + faker.lorem.word({ length: { min: 10, max: 10 } });

    await test.step(`Dialog Klasse anlegen öffnen`, async () => {
      await new LandingPage(page).klasseAnlegen();
    });

    await test.step(`Klasse anlegen`, async () => {
      await KlasseCreationView.klasseAnlegen(SCHULNAME, KLASSENNAME);
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(KlasseCreationView.text_h2_KlasseAnlegen).toHaveText(
        "Neue Klasse hinzufügen",
      );
      await expect(KlasseCreationView.button_Schliessen).toBeVisible();
      await expect(KlasseCreationView.text_success).toHaveText(
        "Die Klasse wurde erfolgreich hinzugefügt.",
      );
      await expect(KlasseCreationView.icon_success).toBeVisible();
      await expect(KlasseCreationView.text_DatenGespeichert).toBeVisible();
      await expect(KlasseCreationView.label_Schule).toBeVisible();
      await expect(KlasseCreationView.data_Schule).toHaveText(
        DIENSTSTELLENNUMMER + " (" + SCHULNAME + ")",
      );
      await expect(KlasseCreationView.label_Klasse).toBeVisible();
      await expect(KlasseCreationView.data_Klasse).toHaveText(KLASSENNAME);
      await expect(
        KlasseCreationView.button_WeitereKlasseAnlegen,
      ).toBeVisible();
      await expect(
        KlasseCreationView.button_ZurueckErgebnisliste,
      ).toBeVisible();
    });

    await test.step(`Testdaten löschen via API`, async () => {
      const KlassenID: string = await getKlasseId(page, KLASSENNAME);
      await deleteKlasse(page, KlassenID);
    });
  });
});
