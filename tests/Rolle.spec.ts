import { expect, test } from "@playwright/test";
import { StartPage } from "../pages/StartView.page";
import { MenuPage } from "../pages/MenuBar.page";
import { RolleCreationViewPage } from "../pages/admin/RolleCreationView.page";
import { faker } from "@faker-js/faker/locale/de";
import { HeaderPage } from "../pages/Header.page";
import { getRolleId, deleteRolle } from "../base/api/testHelperRolle.page";
import { RolleCreationConfirmPage } from "../pages/admin/RolleCreationConfirm.page";
import FromAnywhere from "../pages/FromAnywhere";
import { LONG, SHORT, STAGE } from "../base/tags";
import { deleteRolleByName } from "../base/testHelperDeleteTestdata";

let startseite: StartPage;
let loggedIn = false;
let rolleName: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht 

test.beforeEach(async ({ page }) => {
  startseite = await test.step(`Login`, async () => {
    const startPage = await FromAnywhere(page)
      .start()
      .then((landing) => landing.goToLogin())
      .then((login) => login.login());
    loggedIn = true;
    return startPage;
  });
});

test.afterEach(async ({ page }) => {
  await test.step(`Testdaten löschen via API`, async () => {
    if (rolleName) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat   
      await deleteRolleByName(rolleName, page);
      rolleName = [];
    }
  });

  if (loggedIn) {
    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
      loggedIn = false;
    });
  }
});

test.describe(`Testfälle für die Administration von Rollen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test("2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ({
    page,
  }) => {
    const zufallsnummer = faker.number.bigInt({ min: 1000, max: 9000 });
    const rollenname1 =
      "TAuto-PW-R1-" +
      faker.lorem.word({ length: { min: 8, max: 12 } }) +
      zufallsnummer;
    const rollenname2 =
      "TAuto-PW-R2-" +
      faker.lorem.word({ length: { min: 8, max: 12 } }) +
      zufallsnummer;
    const schulstrukturknoten1 = "Land Schleswig-Holstein";
    const schulstrukturknoten2 = "0703754 (Amalie-Sieveking-Schule)";
    const rollenart1 = "Lern";
    const rollenart2 = "Lehr";
    const merkmal2 = "KoPers.-Nr. ist Pflichtangabe";
    const angebot1 = "itslearning";
    const angebotA2 = "E-Mail";
    const angebotB2 = "Kalender";

    const rolleCreationView =
      await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        const rolleCreationView = await startseite
          .goToAdministration()
          .then((menu) => menu.rolleAnlegen());
        await expect(rolleCreationView.text_h2_RolleAnlegen).toHaveText(
          "Neue Rolle hinzufügen",
        );
        return rolleCreationView;
      });

    await test.step(`Erste Rolle anlegen`, async () => {
      await rolleCreationView.schulstrukturknoten.selectByTitle(
        schulstrukturknoten1,
      );
      await rolleCreationView.rollenarten.selectByTitle(rollenart1);
      await rolleCreationView.enterRollenname(rollenname1);
      await rolleCreationView.angebote.selectByTitle(angebot1);
      await rolleCreationView.button_RolleAnlegen.click();
      await expect(rolleCreationView.text_success).toBeVisible();
      await expect(rolleCreationView.data_Administrationsebene).toHaveText(schulstrukturknoten1);
      await expect(rolleCreationView.icon_success).toBeVisible();
      await expect(rolleCreationView.data_Angebote).toHaveText(angebot1);
      rolleName.push(rollenname1);
    });

    await test.step(`Zweite Rolle anlegen`, async () => {
      await rolleCreationView.button_WeitereRolleAnlegen.click();

      await rolleCreationView.schulstrukturknoten.selectByTitle(
        schulstrukturknoten2,
      );
      await rolleCreationView.rollenarten.selectByTitle(rollenart2);
      await rolleCreationView.enterRollenname(rollenname2);
      await rolleCreationView.merkmale.selectByTitle(merkmal2);
      await rolleCreationView.angebote.selectByTitle(angebotA2);
      await rolleCreationView.angebote.selectByTitle(angebotB2);
      await rolleCreationView.button_RolleAnlegen.click();
      await expect(rolleCreationView.text_success).toBeVisible();
      await expect(rolleCreationView.data_Administrationsebene).toHaveText(schulstrukturknoten2);
      await expect(rolleCreationView.icon_success).toBeVisible();
      await expect(rolleCreationView.data_Angebote).toContainText(angebotA2);
      await expect(rolleCreationView.data_Angebote).toContainText(angebotB2);
      rolleName.push(rollenname2);
    });

    await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
      const rolleManagementView = await rolleCreationView
        .menu()
        .alleRollenAnzeigen();
      await expect(rolleManagementView.text_h2_Rollenverwaltung).toHaveText(
        "Rollenverwaltung",
      );
      await expect(page.getByRole("cell", { name: rollenname1 })).toBeVisible();
      await expect(page.getByRole("cell", { name: rollenname2 })).toBeVisible();
    });
  });

  test("Ergebnisliste Rollen auf Vollständigkeit prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async () => {
    await test.step(`Rollenverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      const menu: MenuPage = await startseite.goToAdministration();
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

  test("Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen als Landesadmin", {tag: [LONG, SHORT, STAGE]}, async ( ) => {
    const rollenname =
      "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 } });
    const schulstrukturknoten = "Land Schleswig-Holstein";
    const rollenart = "Leit";
    const merkmal = "KoPers.-Nr. ist Pflichtangabe";
    const angebotA = "E-Mail";
    const angebotB = "Schulportal-Administration";
    const angebotC = "Kalender";
    const systemrechtA = "Darf Benutzer verwalten";
    const systemrechtB = "Darf Schulen verwalten";
    const systemrechtC = "Darf Klassen verwalten";

    const rolleCreationView =
      await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        return await startseite
          .goToAdministration()
          .then((menu) => menu.rolleAnlegen());
      });

    const rolleCreationConfirmPage: RolleCreationConfirmPage =
      await test.step(`Rolle anlegen`, async () => {
        await rolleCreationView.schulstrukturknoten.selectByTitle(schulstrukturknoten);
        await rolleCreationView.rollenarten.selectByTitle(rollenart);
        await rolleCreationView.enterRollenname(rollenname);
        await rolleCreationView.merkmale.selectByTitle(merkmal);
        await rolleCreationView.angebote.selectByTitle(angebotA);
        await rolleCreationView.angebote.selectByTitle(angebotB);
        await rolleCreationView.angebote.selectByTitle(angebotC);

        await rolleCreationView.systemrechte.selectByTitle(systemrechtA);
        await rolleCreationView.systemrechte.selectByTitle(systemrechtB);
        await rolleCreationView.systemrechte.selectByTitle(systemrechtC);

        return await rolleCreationView.createRolle();
      });

    await test.step(`Bestätigungsseite prüfen`, async () => {
      await expect(rolleCreationConfirmPage.text_h2_RolleAnlegen).toHaveText(
        "Neue Rolle hinzufügen",
      );
      await expect(rolleCreationConfirmPage.button_Schliessen).toBeVisible();
      await expect(rolleCreationConfirmPage.text_success).toBeVisible();
      rolleName.push(rollenname);
      await expect(rolleCreationConfirmPage.text_DatenGespeichert).toHaveText(
        "Folgende Daten wurden gespeichert:",
      );
      await expect(
        rolleCreationConfirmPage.label_Administrationsebene,
      ).toHaveText("Administrationsebene:");
      await expect(
        rolleCreationConfirmPage.data_Administrationsebene,
      ).toHaveText(schulstrukturknoten);
      await expect(rolleCreationConfirmPage.label_Rollenart).toHaveText(
        "Rollenart:",
      );
      await expect(rolleCreationConfirmPage.data_Rollenart).toHaveText(
        rollenart,
      );
      await expect(rolleCreationConfirmPage.label_Rollenname).toHaveText(
        "Rollenname:",
      );
      await expect(rolleCreationConfirmPage.data_Rollenname).toHaveText(
        rollenname,
      );
      await expect(rolleCreationConfirmPage.label_Merkmale).toHaveText(
        "Merkmale:",
      );
      await expect(rolleCreationConfirmPage.data_Merkmale).toHaveText(merkmal);
      await expect(rolleCreationConfirmPage.label_Angebote).toHaveText(
        "Zugeordnete Angebote:",
      );
      await expect(rolleCreationConfirmPage.data_Angebote).toContainText(
        angebotA,
      );
      await expect(rolleCreationConfirmPage.data_Angebote).toContainText(
        angebotB,
      );
      await expect(rolleCreationConfirmPage.data_Angebote).toContainText(
        angebotC,
      );
      await expect(rolleCreationConfirmPage.label_Systemrechte).toHaveText(
        "Systemrechte:",
      );
      await expect(rolleCreationConfirmPage.data_Systemrechte).toContainText(
        systemrechtA + ", " + systemrechtB + ", " + systemrechtC,
      );
      await expect(
        rolleCreationConfirmPage.button_WeitereRolleAnlegen,
      ).toBeVisible();
      await expect(
        rolleCreationConfirmPage.button_ZurueckErgebnisliste,
      ).toBeVisible();
    });
  });
});

test.describe("Testet die Anlage einer neuen Rolle", () => {
  let roleName: string | undefined = undefined;

  test("Eine neue Rolle anlegen und sicherstellen, dass alle Serviceprovider angezeigt werden und verfügbar sind", {tag: [LONG]}, async () => {
    const rolleCreationView: RolleCreationViewPage =
      await test.step("Rolle anlegen aufrufen", async () => {
        return await startseite
          .goToAdministration()
          .then((menu) => menu.rolleAnlegen());
      });

    const rolleCreationConfirm: {
      rolleCreationConfirmPage: RolleCreationConfirmPage;
      selectedSPs: string[];
    } = await test.step("Rolle mit mehr als 5 SPs anlegen", async () => {
      await rolleCreationView.schulstrukturknoten.selectByTitle(
        "Land Schleswig-Holstein",
      );
      await rolleCreationView.rollenarten.selectByTitle("Lehr");
      roleName = "Neue Rolle aus Test";
      await rolleCreationView.enterRollenname(roleName);
      const theFirstSeven = Array.from({ length: 7 }, (_, key) => key);
      const selectedItems: string[] =
        await rolleCreationView.angebote.selectByPosition(theFirstSeven);
      return {
        rolleCreationConfirmPage: await rolleCreationView.createRolle(),
        selectedSPs: selectedItems,
      };
    });

    const rolleManagementPage =
      await test.step("Anlage prüfen und zurück", async () => {
        const { rolleCreationConfirmPage } = rolleCreationConfirm;
        await expect(rolleCreationConfirmPage.confirmationMessage).toBeVisible();
        await expect(rolleCreationView.data_Administrationsebene).toHaveText('Land Schleswig-Holstein');
        await expect(rolleCreationView.icon_success).toBeVisible();
        await expect(rolleCreationView.data_Angebote).toContainText('E-Mail');
        return rolleCreationConfirmPage.backToResultList();
      });

    await test.step("Rollentabelle prüfen", async () => {
      expect(roleName).toBeDefined();
      const row = rolleManagementPage.rowByRoleName(roleName!);
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