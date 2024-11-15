import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/Header.page";
import { LONG } from "../base/tags";
import { schuelerRolle } from "../base/rollen";
import { PersonImportViewPage } from "../pages/admin/PersonImportView.page";
import path from "path";
import FromAnywhere from "../pages/FromAnywhere";

const PW: string = process.env.PW as string;
const ADMIN: string = process.env.USER as string;
const FRONTEND_URL: string = process.env.FRONTEND_URL || "";
let importPage: PersonImportViewPage = undefined as unknown as PersonImportViewPage;

// schulen cannot be deleted yet, so we use this testschule, which should already exist
const schulname = "Testschule-PW665";

test.describe(`Testfälle für den Benutzerimport": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }) => {
    await test.step(`Einloggen und zu Benutzerimport navigieren`, async () => {
      await page.goto(FRONTEND_URL);
      importPage = (await
        (await
          (await
            (await
              (await FromAnywhere(page).start())
            .goToLogin())
          .login(ADMIN, PW))
        .goToAdministration())
      .goToBenutzerImport());

      await expect(importPage.headlineBenutzerImport).toBeVisible();
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step(`Testdaten löschen via API`, async () => {
      // delete imported users
    });

    await test.step(`Abmelden`, async () => {
      const header = new HeaderPage(page);
      await header.logout();
    });
  });

  test("Als Landesadmin eine CSV-Datei mit Benutzerdaten hochladen und importieren", {tag: [LONG]}, async ({ page }) => {
    await test.step(``, async () => {
      // select schule
      await importPage.schuleSelectInput.click();
      await importPage.schuleSelectInput.fill(schulname);
      await page.getByRole('option', { name: `(${schulname})` }).click();
      // await page.getByText(schulname).click();

      // select rolle
      await importPage.rolleSelectInput.click();
      await page.getByRole('option', { name: schuelerRolle }).click();

      // upload CSV file
      await importPage.fileInput.setInputFiles(path.join(__dirname, '../fixtures/Benutzerimport_Lernrolle_UTF-8.csv'));

      // submit

      // check success message with data sets

      // click import

      // check success message

      // download file

      // check file content

      // check imported users in person management view
    });
  });
});