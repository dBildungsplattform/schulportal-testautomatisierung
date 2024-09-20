import { expect, test } from "@playwright/test";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { RolleCreationViewPage } from "../pages/admin/RolleCreationView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { deleteRolle, getRolleId } from "../base/api/testHelperRolle.page";
import { RolleCreationConfirmPage } from "../pages/admin/RolleCreationConfirm.page";
import FromAnywhere from "../pages/FromAnywhere";

let startseite: StartPage;
let loggedIn = false;
test.beforeEach(async ({ page }) => {
  startseite = await test.step(`Login`, async () => {
    const startPage = await FromAnywhere(page)
      .start()
      .then((landing) => landing.login())
      .then((login) => login.login());
    loggedIn = true;
    return startPage;
  });
});

test.afterEach(async ({ page }) => {
  if (loggedIn) {
    await test.step(`Abmelden`, async () => {
      const Header = new HeaderPage(page);
      await Header.button_logout.click();
      loggedIn = false;
    });
  }
});

test.describe(`Testfälle für die Administration von Rollen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test("2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR als Landesadmin @long @short @stage", async ({
    page,
  }) => {
    const ZUFALLSNUMMER = faker.number.bigInt({ min: 1000, max: 9000 });
    const ROLLENNAME1 =
      "TAuto-PW-R1-" +
      faker.lorem.word({ length: { min: 8, max: 12 } }) +
      ZUFALLSNUMMER;
    const ROLLENNAME2 =
      "TAuto-PW-R2-" +
      faker.lorem.word({ length: { min: 8, max: 12 } }) +
      ZUFALLSNUMMER;
    const SCHULSTRUKTURKNOTEN1 = "Land Schleswig-Holstein";
    const SCHULSTRUKTURKNOTEN2 = "0703754 (Amalie-Sieveking-Schule)";
    const ROLLENART1 = "Lern";
    const ROLLENART2 = "Lehr";
    const Merkmal2 = "KoPers.-Nr. ist Pflichtangabe";
    const Angebot1 = "itslearning";
    const AngebotA2 = "E-Mail";
    const AngebotB2 = "Kalender";

    const rolleCreationView =
      await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        const rolleCreationView = await startseite
          .administration()
          .then((menu) => menu.rolleAnlegen());
        await expect(rolleCreationView.text_h2_RolleAnlegen).toHaveText(
          "Neue Rolle hinzufügen",
        );
        return rolleCreationView;
      });

    await test.step(`Erste Rolle anlegen`, async () => {
      await rolleCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(SCHULSTRUKTURKNOTEN1, { exact: true }).click();
      await rolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART1, { exact: true }).click();
      await rolleCreationView.input_Rollenname.fill(ROLLENNAME1);
      await rolleCreationView.combobox_Angebote.click();
      await page.getByText(Angebot1, { exact: true }).click();
      await rolleCreationView.button_RolleAnlegen.click();
      await expect(rolleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Rolle anlegen`, async () => {
      await rolleCreationView.button_WeitereRolleAnlegen.click();

      await rolleCreationView.combobox_Schulstrukturknoten.click();
      await page.getByText(SCHULSTRUKTURKNOTEN2, { exact: true }).click();
      await rolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART2, { exact: true }).click();

      await rolleCreationView.input_Rollenname.fill(ROLLENNAME2);
      await rolleCreationView.combobox_Merkmal.click();
      await page.getByText(Merkmal2, { exact: true }).click();
      await rolleCreationView.combobox_Angebote.click();
      await page.getByText(AngebotA2, { exact: true }).click();
      await page.getByText(AngebotB2, { exact: true }).click();

      await rolleCreationView.button_RolleAnlegen.click();
      await expect(rolleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
      const rolleManagementView = await rolleCreationView
        .menu()
        .alleRollenAnzeigen();
      await expect(rolleManagementView.text_h2_Rollenverwaltung).toHaveText(
        "Rollenverwaltung",
      );
      await expect(page.getByRole("cell", { name: ROLLENNAME1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: ROLLENNAME2 })).toBeVisible();
    });

    await test.step(`Rollen wieder löschen`, async () => {
      const RollenID1 = await getRolleId(page, ROLLENNAME1);
      const RollenID2 = await getRolleId(page, ROLLENNAME2);
      await deleteRolle(page, RollenID1);
      await deleteRolle(page, RollenID2);
    });
  });

  test("Ergebnisliste Rollen auf Vollständigkeit prüfen als Landesadmin @long @short @stage", async () => {
    await test.step(`Rollenverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      const menu: MenuPage = await startseite.administration();
      const rolleManagement = await menu.alleRollenAnzeigen();
      await expect(
        rolleManagement.text_h1_Administrationsbereich,
      ).toBeVisible();
      await expect(rolleManagement.text_h2_Rollenverwaltung).toBeVisible();
      await expect(rolleManagement.table_header_Rollenname).toBeVisible();
      await expect(rolleManagement.table_header_Rollenart).toBeVisible();
      await expect(rolleManagement.table_header_Merkmale).toBeVisible();
      await expect(
        rolleManagement.table_header_Administrationsebene,
      ).toBeVisible();
    });
  });

  test("Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen als Landesadmin @long @short @stage", async ({
    page,
  }) => {
    const ROLLENNAME =
      "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 } });
    const DIENSTSTELLENNUMMER = "1111111";
    const SCHULSTRUKTURKNOTEN =
      DIENSTSTELLENNUMMER + " (Testschule Schulportal)";
    const ROLLENART = "Leit";
    const Merkmal = "KoPers.-Nr. ist Pflichtangabe";
    const AngebotA = "E-Mail";
    const AngebotB = "Schulportal-Administration";
    const AngebotC = "Kalender";
    const SystemrechtA = "Darf Benutzer verwalten";
    const SystemrechtB = "Darf Schulen verwalten";
    const SystemrechtC = "Darf Klassen verwalten";

    const rolleCreationView =
      await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        return await startseite
          .administration()
          .then((menu) => menu.rolleAnlegen());
      });

    await test.step(`Rolle anlegen`, async () => {
      await rolleCreationView.combobox_Schulstrukturknoten.click();

      await page.getByText(SCHULSTRUKTURKNOTEN, { exact: true }).click();
      await rolleCreationView.combobox_Rollenart.click();
      await page.getByText(ROLLENART, { exact: true }).click();
      await rolleCreationView.input_Rollenname.fill(ROLLENNAME);
      await rolleCreationView.combobox_Merkmal.click();
      await page.getByText(Merkmal, { exact: true }).click();
      await rolleCreationView.combobox_Angebote.click();
      await page.getByText(AngebotA, { exact: true }).click();
      await page.getByText(AngebotB, { exact: true }).click();
      await page.getByText(AngebotC, { exact: true }).click();
      await rolleCreationView.combobox_Systemrechte.click();
      await page.getByText(SystemrechtA, { exact: true }).click();
      await page.getByText(SystemrechtB, { exact: true }).click();
      await page.getByText(SystemrechtC, { exact: true }).click();

      await rolleCreationView.button_RolleAnlegen.click();
    });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(rolleCreationView.text_h2_RolleAnlegen).toHaveText(
        "Neue Rolle hinzufügen",
      );
      await expect(rolleCreationView.button_Schliessen).toBeVisible();
      await expect(rolleCreationView.text_success).toBeVisible();
      await expect(rolleCreationView.icon_success).toBeVisible();
      await expect(rolleCreationView.text_DatenGespeichert).toHaveText(
        "Folgende Daten wurden gespeichert:",
      );
      await expect(rolleCreationView.label_Administrationsebene).toHaveText(
        "Administrationsebene:",
      );
      await expect(rolleCreationView.data_Administrationsebene).toHaveText(
        SCHULSTRUKTURKNOTEN,
      );
      await expect(rolleCreationView.label_Rollenart).toHaveText("Rollenart:");
      await expect(rolleCreationView.data_Rollenart).toHaveText(ROLLENART);
      await expect(rolleCreationView.label_Rollenname).toHaveText(
        "Rollenname:",
      );
      await expect(rolleCreationView.data_Rollenname).toHaveText(ROLLENNAME);
      await expect(rolleCreationView.label_Merkmale).toHaveText("Merkmale:");
      await expect(rolleCreationView.data_Merkmale).toHaveText(Merkmal);
      await expect(rolleCreationView.label_Angebote).toHaveText(
        "Zugeordnete Angebote:",
      );
      await expect(rolleCreationView.data_Angebote).toContainText(AngebotA);
      await expect(rolleCreationView.data_Angebote).toContainText(AngebotB);
      await expect(rolleCreationView.data_Angebote).toContainText(AngebotC);
      await expect(rolleCreationView.label_Systemrechte).toHaveText(
        "Systemrechte:",
      );
      await expect(rolleCreationView.data_Systemrechte).toContainText(
        SystemrechtA + ", " + SystemrechtB + ", " + SystemrechtC,
      );
      await expect(rolleCreationView.button_WeitereRolleAnlegen).toBeVisible();
      await expect(rolleCreationView.button_ZurueckErgebnisliste).toBeVisible();
    });

    await test.step(`Rolle wieder löschen`, async () => {
      const RollenID = await getRolleId(page, ROLLENNAME);
      await deleteRolle(page, RollenID);
    });
  });
});

test.describe("Testet die Anlage einer neuen Rolle", () => {
  let roleName: string | undefined = undefined;

  test("Eine neue Rolle anlegen und sicherstellen, dass alle Serviceprovider angezeigt werden und verfügbar sind @long", async () => {
    const rolleCreationView: RolleCreationViewPage =
      await test.step("Rolle anlegen aufrufen", async () => {
        return await startseite
          .administration()
          .then((menu) => menu.rolleAnlegen());
      });

    const rolleCreationConfirm: {
      rolleCreationConfirmPage: RolleCreationConfirmPage;
      selectedSPs: string[];
    } = await test.step("Rolle mit mehr als 5 SPs anlegen", async () => {
      await rolleCreationView.selectSchulstrukturknoten(
        "Land Schleswig-Holstein",
      );
      await rolleCreationView.selectRollenart("Lehr");
      roleName = "Neue Rolle aus Test";
      await rolleCreationView.enterRollenname(roleName);
      const theFirstSeven = Array.from({ length: 7 }, (_, key) => key);
      const selectedItems: string[] =
        await rolleCreationView.serviceProviderComboBox.selectByPosition(
          theFirstSeven,
        );
      return {
        rolleCreationConfirmPage: await rolleCreationView.createRolle(),
        selectedSPs: selectedItems,
      };
    });

    const rolleManagementPage =
      await test.step("Anlage prüfen und zurück", async () => {
        const { rolleCreationConfirmPage } = rolleCreationConfirm;
        await expect(
          rolleCreationConfirmPage.confirmationMessage,
        ).toBeVisible();
        return rolleCreationConfirmPage.backToResultList();
      });

    await test.step("Rollentabelle prüfen", async () => {
      const row = rolleManagementPage.rowByRoleName(roleName);
      await expect(row.locator).toBeVisible();

      const spCell = row.spCell();
      for (const sp of rolleCreationConfirm.selectedSPs) {
        await expect.soft(spCell).toContainText(sp);
      }
    });
  });

  test.afterEach(async ({ page }) => {
    if (roleName) {
      const roleId = await getRolleId(page, roleName);
      await deleteRolle(page, roleId);
    }
  });
});
