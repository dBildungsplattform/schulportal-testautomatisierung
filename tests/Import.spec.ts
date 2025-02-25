import { test, expect, Download, PlaywrightTestArgs } from "@playwright/test";
import { HeaderPage } from "../pages/Header.page";
import { LONG } from "../base/tags";
import { schuelerRolle } from "../base/rollen";
import FromAnywhere from "../pages/FromAnywhere";
import { PersonImportViewPage } from "../pages/admin/PersonImportView.page";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { deletePersonBySearchString } from "../base/testHelperDeleteTestdata.js";

// schulen cannot be deleted yet, so we use this testschule, which should already exist
import { testschule665Name } from "../base/organisation.js";

const PW: string = process.env.PW as string;
const ADMIN: string = process.env.USER as string;
let personImportPage: PersonImportViewPage = undefined as unknown as PersonImportViewPage;

test.describe(`Testfälle für den Benutzerimport": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  // convert csv to array to make person data accessible, also trim data and filter empty lines
  const filename: string = fileURLToPath(import.meta.url);
  const dirname: string = path.dirname(filename);
  const csvPath: string = path.join(dirname, '../fixtures/Benutzerimport_Lernrolle_UTF-8.csv');
  const csvAsArray: string[] = fs.readFileSync(csvPath).toString().split('\n').map(el => el.trim()).filter(e => e !== '');

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Einloggen und zu Benutzerimport navigieren', async () => {
      await page.goto('/');
      personImportPage = (await
        (await
          (await
            (await
              (await FromAnywhere(page).start())
            .goToLogin())
          .login(ADMIN, PW))
        .goToAdministration())
      .goToBenutzerImport());

      await expect(personImportPage.personImportCard).toBeVisible();
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Importierte Daten über die API löschen', async () => {
      for (let index = 1; index < csvAsArray.length; index++) {
        const person = csvAsArray[index];
        const nachname: string = person.split(';')[0];

        await deletePersonBySearchString(page, nachname);
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.logout();
    });
  });

  test('Als Landesadmin eine CSV-Datei mit Benutzerdaten hochladen und importieren', {tag: [LONG]}, async ({ page }: PlaywrightTestArgs) => {
    await test.step('CSV-Datei hochladen, importieren und importierte Daten downloaden', async () => {
      // select schule
      await personImportPage.schuleSelectCombobox.searchByTitle(testschule665Name, false);

      // select rolle
      await personImportPage.rolleSelectInput.click();
      await page.getByRole('option', { name: schuelerRolle }).click();

      // upload CSV file
      await personImportPage.fileInput.setInputFiles(csvPath);

      // submit and assert text
      // calculate number of personen in csv
      const personenTotal = csvAsArray.length - 1;
      await personImportPage.submitFileUploadButton.click();
      await expect(personImportPage.uploadSuccessText).toHaveText(`Die Datei wurde erfolgreich hochgeladen. ${personenTotal} Datensätze stehen zum Import bereit.`);

      // click import and assert success message
      await personImportPage.openConfirmationDialogButton.click();
      await expect(personImportPage.importConfirmationText).toHaveText('Achtung, diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie den Import wirklich durchführen?');
      await personImportPage.executeImportButton.click();
      await expect(personImportPage.importSuccessText).toHaveText('Die Daten wurden erfolgreich importiert. Die importierten Daten stehen zum Download bereit.');

      // download file
      const downloadPromise = page.waitForEvent('download');
      await personImportPage.downloadFileButton.click();
      const download: Download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('Benutzerdaten.txt');

      // check imported users in person management view
      // get first person from csv and split data by ";"
      const firstPerson: string[] = csvAsArray[1].split(';');
      // get last name from first person to search in person management view
      const firstPersonLastName: string = firstPerson[0];
      
      const personManagementPage: PersonManagementViewPage = await personImportPage.navigateToPersonManagementView();
      await page.waitForURL('**/admin/personen');
      await personManagementPage.input_Suchfeld.fill(firstPersonLastName);
      await personManagementPage.button_Suchen.click();
      await expect(page.getByRole('cell', { name: firstPersonLastName, exact: true })).toBeVisible();
    });
  });
});