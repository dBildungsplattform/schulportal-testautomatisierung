import { test, expect, Page } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { SchuleCreationViewPage } from '../pages/admin/SchuleCreationView.page';
import { SchuleManagementViewPage } from '../pages/admin/SchuleManagementView.page';
import { HeaderPage } from '../pages/Header.page';
import { FooterDataTablePage } from '../pages/FooterDataTable.page';
import { LONG, SHORT, STAGE, BROWSER } from '../base/tags';
import { deletePersonById, deleteRolleById } from '../base/testHelperDeleteTestdata';
import { generateSchulname, generateDienststellenNr } from '../base/testHelperGenerateTestdataNames';
import FromAnywhere from '../pages/FromAnywhere';

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    let startseite:StartPage;
    startseite = await test.step(`Login`, async () => {
      const startPage = await FromAnywhere(page)
        .start()
        .then((landing) => landing.goToLogin())
        .then((login) => login.login())
        .then((startseite) => startseite.checkHeadlineIsVisible());
  
      return startPage;
    });
  });

  test.afterEach(async ({ page }: { page: Page }) => {
    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.logout();
    });
  });

  test('2 Schulen nacheinander anlegen als Landesadmin', { tag: [LONG] }, async ({ page }: { page: Page }) => {
    const startseite: StartPage = new StartPage(page);
    const schuleManagementView: SchuleManagementViewPage = new SchuleManagementViewPage(page);
    const footerDataTable: FooterDataTablePage = new FooterDataTablePage(page);

    // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
    const schulname1: string = await generateSchulname();
    const schulname2: string = await generateSchulname();
    const dienststellenNr1: string = await generateDienststellenNr();
    const dienststellenNr2: string = await generateDienststellenNr();

    const { menue, schuleCreationView }: { menue: MenuPage; schuleCreationView: SchuleCreationViewPage } =
      await test.step(`Dialog Schule anlegen öffnen`, async (): Promise<{
        menue: MenuPage;
        schuleCreationView: SchuleCreationViewPage;
      }> => {
        const menue: MenuPage = await startseite.goToAdministration();
        const schuleCreationView: SchuleCreationViewPage = await menue.schuleAnlegen();
        await menue.menueItem_SchuleAnlegen.click();
        await expect(schuleCreationView.text_h2_SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
        return { menue, schuleCreationView };
      });

    await test.step(`Erste Schule anlegen`, async () => {
      await schuleCreationView.radio_button_Public_Schule.click();

      await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr1);
      await schuleCreationView.input_Schulname.fill(schulname1);
      await schuleCreationView.button_SchuleAnlegen.click();
      await expect(schuleCreationView.text_success).toBeVisible();
    });

    await test.step(`Zweite Schule anlegen`, async () => {
      await schuleCreationView.button_WeitereSchuleAnlegen.click();
      await schuleCreationView.radio_button_Public_Schule.click();

      await schuleCreationView.input_Dienststellennummer.click();
      await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr2);

      await schuleCreationView.input_Schulname.fill(schulname2);
      await schuleCreationView.button_SchuleAnlegen.click();
      await expect(schuleCreationView.text_success).toBeVisible();
    });

    await test.step(`In der Ergebnisliste prüfen, dass die beiden neuen Schulen angezeigt werden`, async () => {
      await menue.menueItem_AlleSchulenAnzeigen.click();
      await footerDataTable.combobox_AnzahlEintraege.click();
      await page.getByText('300', { exact: true }).click();
      await expect(schuleManagementView.text_h2_Schulverwaltung).toHaveText('Schulverwaltung');
      await expect(page.getByRole('cell', { name: schulname1 })).toBeVisible();
      await expect(page.getByRole('cell', { name: schulname2 })).toBeVisible();
    });
  });

  test(
    'Ergebnisliste Schulen auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async ({ page }: { page: Page }) => {
      const startseite: StartPage = new StartPage(page);

      await test.step(`Schulverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        const menue: MenuPage = await startseite.goToAdministration();
        const schuleManagementView: SchuleManagementViewPage = await menue.alleSchulenAnzeigen();
        await expect(schuleManagementView.text_h1_Administrationsbereich).toBeVisible();
        await expect(schuleManagementView.text_h2_Schulverwaltung).toBeVisible();
        await expect(schuleManagementView.text_h2_Schulverwaltung).toHaveText('Schulverwaltung');
        await expect(schuleManagementView.table_header_Dienststellennummer).toBeVisible();
        await expect(schuleManagementView.table_header_Schulname).toBeVisible();
      });
    }
  );

  test(
    'Eine Schule anlegen als Landesadmin und die Bestätigungsseite vollständig prüfen',
    { tag: [LONG, SHORT] },
    async ({ page }: { page: Page }) => {
      // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird am dem Schulnamen eine Zufallszahl angehängt
      const schulname: string = await generateSchulname();
      const dienststellenNr: string = await generateDienststellenNr();

      const startseite: StartPage = new StartPage(page);

      const schuleCreationView: SchuleCreationViewPage =
        await test.step(`Dialog Schule anlegen öffnen als Schuladmin`, async () => {
          const menue: MenuPage = await startseite.goToAdministration();
          const schuleCreationView: SchuleCreationViewPage = await menue.schuleAnlegen();
          return schuleCreationView;
        });

      const schultraeger: string = await test.step(`Schule anlegen`, async () => {
        const schultraeger: string = await schuleCreationView.radio_button_Public_Schule.innerText();
        await schuleCreationView.radio_button_Public_Schule.click();
        await schuleCreationView.input_Dienststellennummer.fill(dienststellenNr);
        await schuleCreationView.input_Schulname.fill(schulname);
        await schuleCreationView.button_SchuleAnlegen.click();
        return schultraeger;
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await expect(schuleCreationView.text_success).toBeVisible();
        await expect(schuleCreationView.text_h2_SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
        await expect(schuleCreationView.button_Schliessen).toBeVisible();
        await expect(schuleCreationView.text_success).toBeVisible();
        await expect(schuleCreationView.icon_success).toBeVisible();
        await expect(schuleCreationView.text_DatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
        await expect(schuleCreationView.label_Schulform).toHaveText('Schulform:');
        await expect(schuleCreationView.data_Schulform).toContainText(schultraeger);
        await expect(schuleCreationView.label_Dienststellennummer).toHaveText('Dienststellennummer:');
        await expect(schuleCreationView.data_Dienststellennummer).toHaveText(dienststellenNr);
        await expect(schuleCreationView.label_Schulname).toHaveText('Schulname:');
        await expect(schuleCreationView.data_Schulname).toHaveText(schulname);
        await expect(schuleCreationView.button_WeitereSchuleAnlegen).toBeVisible();
        await expect(schuleCreationView.button_ZurueckErgebnisliste).toBeVisible();
      });
    }
  );
});
