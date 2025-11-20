import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { DEV, STAGE } from '../base/tags';
import { generateDienststellenNr, generateSchulname } from '../base/utils/generateTestdata';
import FromAnywhere from '../pages/FromAnywhere';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { SchuleCreationViewPage } from '../pages/admin/organisationen/schulen/SchuleCreationView.page';
import { SchuleManagementViewPage } from '../pages/admin/organisationen/schulen/SchuleManagementView.page';
import { FooterDataTablePage } from '../pages/components/FooterDataTable.page';
import { HeaderPage } from '../pages/components/Header.page';
import { MenuPage } from '../pages/components/MenuBar.page';

let logoutViaStartPage: boolean = false;

test.describe(`Testfälle für die Administration von Schulen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      const startPage: StartPage = await FromAnywhere(page)
        .start()
        .then((landing: LandingPage) => landing.goToLogin())
        .then((login: LoginPage) => login.login())
        .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

      return startPage;
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
    });
  });

  // TODO: should run against stage, once Schulen can be deleted
  test(
    '2 Schulen nacheinander anlegen als Landesadmin',
    { tag: [/*STAGE,*/ DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);
      const schuleManagementView: SchuleManagementViewPage = new SchuleManagementViewPage(page);
      const footerDataTable: FooterDataTablePage = new FooterDataTablePage(page);

      // Schulen können noch nicht gelöscht werden. Um doppelte Namen zu vermeiden, wird dem Schulnamen eine Zufallszahl angehängt
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
          await menue.menueItemSchuleAnlegen.click();
          await expect(schuleCreationView.textH2SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
          return { menue, schuleCreationView };
        });

      await test.step(`Erste Schule anlegen`, async () => {
        await schuleCreationView.radioButtonPublicSchule.click();

        await schuleCreationView.inputDienststellennummer.fill(dienststellenNr1);
        await schuleCreationView.inputSchulname.fill(schulname1);
        await schuleCreationView.buttonSchuleAnlegen.click();
        await expect(schuleCreationView.textSuccess).toBeVisible();
      });

      await test.step(`Zweite Schule anlegen`, async () => {
        await schuleCreationView.buttonWeitereSchuleAnlegen.click();
        await schuleCreationView.radioButtonPublicSchule.click();

        await schuleCreationView.inputDienststellennummer.click();
        await schuleCreationView.inputDienststellennummer.fill(dienststellenNr2);

        await schuleCreationView.inputSchulname.fill(schulname2);
        await schuleCreationView.buttonSchuleAnlegen.click();
        await expect(schuleCreationView.textSuccess).toBeVisible();
      });

      await test.step(`In der Ergebnisliste prüfen, dass die beiden neuen Schulen angezeigt werden`, async () => {
        await menue.menueItemAlleSchulenAnzeigen.click();
        await footerDataTable.comboboxAnzahlEintraege.click();
        await page.getByText('300', { exact: true }).click();
        await expect(schuleManagementView.textH2Schulverwaltung).toHaveText('Schulverwaltung');
        await expect(page.getByRole('cell', { name: schulname1 })).toBeVisible();
        await expect(page.getByRole('cell', { name: schulname2 })).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Ergebnisliste Schulen auf Vollständigkeit prüfen als Landesadmin',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const startseite: StartPage = new StartPage(page);

      await test.step(`Schulverwaltung öffnen und Alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        const menue: MenuPage = await startseite.goToAdministration();
        const schuleManagementView: SchuleManagementViewPage = await menue.alleSchulenAnzeigen();
        await expect(schuleManagementView.textH1Administrationsbereich).toBeVisible();
        await expect(schuleManagementView.textH2Schulverwaltung).toBeVisible();
        await expect(schuleManagementView.textH2Schulverwaltung).toHaveText('Schulverwaltung');
        await expect(schuleManagementView.tableHeaderDienststellennummer).toBeVisible();
        await expect(schuleManagementView.tableHeaderSchulname).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  // TODO: should STAGE run against stage, once Schulen can be deleted
  test(
    'Eine Schule anlegen als Landesadmin und die Bestätigungsseite vollständig prüfen',
    { tag: [/*STAGE,*/ DEV] },
    async ({ page }: PlaywrightTestArgs) => {
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
        const schultraeger: string = await schuleCreationView.radioButtonPublicSchule.innerText();
        await schuleCreationView.radioButtonPublicSchule.click();
        await schuleCreationView.inputDienststellennummer.fill(dienststellenNr);
        await schuleCreationView.inputSchulname.fill(schulname);
        await schuleCreationView.buttonSchuleAnlegen.click();
        return schultraeger;
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await expect(schuleCreationView.textSuccess).toBeVisible();
        await expect(schuleCreationView.textH2SchuleAnlegen).toHaveText('Neue Schule hinzufügen');
        await expect(schuleCreationView.buttonSchliessen).toBeVisible();
        await expect(schuleCreationView.textSuccess).toBeVisible();
        await expect(schuleCreationView.iconSuccess).toBeVisible();
        await expect(schuleCreationView.textDatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
        await expect(schuleCreationView.labelSchulform).toHaveText('Schulform:');
        await expect(schuleCreationView.dataSchulform).toContainText(schultraeger);
        await expect(schuleCreationView.labelDienststellennummer).toHaveText('Dienststellennummer:');
        await expect(schuleCreationView.dataDienststellennummer).toHaveText(dienststellenNr);
        await expect(schuleCreationView.labelSchulname).toHaveText('Schulname:');
        await expect(schuleCreationView.dataSchulname).toHaveText(schulname);
        await expect(schuleCreationView.buttonWeitereSchuleAnlegen).toBeVisible();
        await expect(schuleCreationView.buttonZurueckErgebnisliste).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );
});
