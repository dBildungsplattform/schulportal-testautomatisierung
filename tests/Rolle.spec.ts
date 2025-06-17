import { expect, Locator, PlaywrightTestArgs, test } from '@playwright/test';
import { deleteRolle, getRolleId } from '../base/api/testHelperRolle.page';
import { ersatzLandSH, landSH } from '../base/organisation';
import { landesadminRolle } from '../base/rollen';
import { email, itslearning, kalender, schulportaladmin } from '../base/sp';
import { BROWSER, LONG, SHORT, STAGE } from '../base/tags';
import { deleteRolleByName } from '../base/testHelperDeleteTestdata';
import { generateRolleName } from '../base/testHelperGenerateTestdataNames';
import { RolleCreationConfirmPage } from '../pages/admin/rollen/RolleCreationConfirm.page';
import { RolleCreationViewPage } from '../pages/admin/rollen/RolleCreationView.page';
import { RolleDetailsViewPage } from '../pages/admin/rollen/RolleDetailsView.page';
import { RoleTableRow, RolleManagementViewPage } from '../pages/admin/rollen/RolleManagementView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/components/Header.page';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { MenuPage } from '../pages/components/MenuBar.page';
import { StartPage } from '../pages/StartView.page';

let startseite: StartPage;
let loggedIn: boolean = false;
// The created test data will be deleted in the afterEach block
let rolleNames: string[] = [];
let logoutViaStartPage: boolean = false;

test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
  startseite = await test.step(`Login`, async () => {
    const startPage: StartPage = await FromAnywhere(page)
      .start()
      .then((landing: LandingPage) => landing.goToLogin())
      .then((login: LoginPage) => login.login())
      .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

    loggedIn = true;
    return startPage;
  });
});

test.afterEach(async ({ page }: PlaywrightTestArgs) => {
  await test.step(`Testdaten löschen via API`, async () => {
    if (rolleNames.length > 0) {
      await deleteRolleByName(rolleNames, page);
      rolleNames = [];
    }
  });

  if (loggedIn) {
    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      if (logoutViaStartPage) {
        await header.logout({ logoutViaStartPage: true });
      } else {
        await header.logout({ logoutViaStartPage: false });
      }
      loggedIn = false;
    });
  }
});

test.describe(`Testfälle für die Administration von Rollen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test(
    '2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const rollenname1: string = await generateRolleName();
      const rollenname2: string = await generateRolleName();
      const schulstrukturknoten1: string = landSH;
      const schulstrukturknoten2: string = ersatzLandSH;
      const rollenart1: string = 'Lern';
      const rollenart2: string = 'Lehr';
      const merkmal2: string = 'KoPers.-Nr. ist Pflichtangabe';
      const angebot1: string = itslearning;
      const angebotA2: string = email;
      const angebotB2: string = kalender;

      const rolleCreationView: RolleCreationViewPage = await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        const rolleCreationView: RolleCreationViewPage = await startseite
          .goToAdministration()
          .then((menu: MenuPage) => menu.rolleAnlegen());
        await expect(rolleCreationView.textH2RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
        return rolleCreationView;
      });

      await test.step(`Erste Rolle anlegen`, async () => {
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle(schulstrukturknoten1);
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle(rollenart1);
        await rolleCreationView.enterRollenname(rollenname1);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebot1);
        await rolleCreationView.buttonRolleAnlegen.click();
        await expect(rolleCreationView.textSuccess).toBeVisible();
        await expect(rolleCreationView.rolleForm.adminstrationsebene.data).toHaveText(schulstrukturknoten1);
        await expect(rolleCreationView.iconSuccess).toBeVisible();
        await expect(rolleCreationView.rolleForm.angebote.data).toHaveText(angebot1);
        rolleNames.push(rollenname1);
      });

      await test.step(`Zweite Rolle anlegen`, async () => {
        await rolleCreationView.buttonWeitereRolleAnlegen.click();
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle(schulstrukturknoten2);
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle(rollenart2);
        await rolleCreationView.enterRollenname(rollenname2);
        await rolleCreationView.rolleForm.merkmale.inputElement.selectByTitle(merkmal2);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotA2);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotB2);
        await rolleCreationView.buttonRolleAnlegen.click();
        await expect(rolleCreationView.textSuccess).toBeVisible();
        await expect(rolleCreationView.rolleForm.adminstrationsebene.data).toHaveText(schulstrukturknoten2);
        await expect(rolleCreationView.iconSuccess).toBeVisible();
        await expect(rolleCreationView.rolleForm.angebote.data).toContainText(angebotA2);
        await expect(rolleCreationView.rolleForm.angebote.data).toContainText(angebotB2);
        rolleNames.push(rollenname2);
      });

      await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
        const rolleManagementView: RolleManagementViewPage = await rolleCreationView.menu().alleRollenAnzeigen();
        await expect(rolleManagementView.textH2Rollenverwaltung).toHaveText('Rollenverwaltung');
        await expect(page.getByRole('cell', { name: rollenname1 })).toBeVisible();
        await expect(page.getByRole('cell', { name: rollenname2 })).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Ergebnisliste Rollen auf Vollständigkeit prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      await test.step(`Rollenverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
        const menu: MenuPage = await startseite.goToAdministration();
        const rolleManagement: RolleManagementViewPage = await menu.alleRollenAnzeigen();
        await expect(rolleManagement.textH1Administrationsbereich).toBeVisible();
        await expect(rolleManagement.textH2Rollenverwaltung).toBeVisible();
        await expect(rolleManagement.tableHeaderRollenname).toBeVisible();
        await expect(rolleManagement.tableHeaderRollenart).toBeVisible();
        await expect(rolleManagement.tableHeaderMerkmale).toBeVisible();
        await expect(rolleManagement.tableHeaderAdministrationsebene).toBeVisible();
        await expect(page.getByRole('cell', { name: 'itslearning-Schüler' })).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test(
    'Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE, BROWSER] },
    async () => {
      const rollenname: string = await generateRolleName();
      const administrationsebene: string = landSH;
      const rollenart: string = 'Leit';
      const merkmal: string = 'KoPers.-Nr. ist Pflichtangabe';
      const angebotA: string = email;
      const angebotB: string = schulportaladmin;
      const angebotC: string = kalender;
      const systemrechtA: string = 'Darf Benutzer verwalten';
      const systemrechtB: string = 'Darf Schulen verwalten';
      const systemrechtC: string = 'Darf Klassen verwalten';

      const rolleCreationView: RolleCreationViewPage = await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        return await startseite.goToAdministration().then((menu: MenuPage) => menu.rolleAnlegen());
      });

      const rolleCreationConfirmPage: RolleCreationConfirmPage = await test.step(`Rolle anlegen`, async () => {
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle(administrationsebene);
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle(rollenart);
        await rolleCreationView.enterRollenname(rollenname);
        await rolleCreationView.rolleForm.merkmale.inputElement.selectByTitle(merkmal);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotA);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotB);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotC);

        await rolleCreationView.rolleForm.systemrechte.inputElement.selectByTitle(systemrechtA);
        await rolleCreationView.rolleForm.systemrechte.inputElement.selectByTitle(systemrechtB);
        await rolleCreationView.rolleForm.systemrechte.inputElement.selectByTitle(systemrechtC);

        return await rolleCreationView.createRolle();
      });

      await test.step(`Bestätigungsseite prüfen`, async () => {
        await expect(rolleCreationConfirmPage.textH2RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
        await expect(rolleCreationConfirmPage.buttonSchliessen).toBeVisible();
        await expect(rolleCreationConfirmPage.textSuccess).toBeVisible();
        rolleNames.push(rollenname);
        await expect(rolleCreationConfirmPage.textDatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
        await expect(rolleCreationConfirmPage.labelAdministrationsebene).toHaveText('Administrationsebene:');
        await expect(rolleCreationConfirmPage.dataAdministrationsebene).toHaveText(administrationsebene);
        await expect(rolleCreationConfirmPage.labelRollenart).toHaveText('Rollenart:');
        await expect(rolleCreationConfirmPage.dataRollenart).toHaveText(rollenart);
        await expect(rolleCreationConfirmPage.labelRollenname).toHaveText('Rollenname:');
        await expect(rolleCreationConfirmPage.dataRollenname).toHaveText(rollenname);
        await expect(rolleCreationConfirmPage.labelMerkmale).toHaveText('Merkmale:');
        await expect(rolleCreationConfirmPage.dataMerkmale).toHaveText(merkmal);
        await expect(rolleCreationConfirmPage.labelAngebote).toHaveText('Zugeordnete Angebote:');
        await expect(rolleCreationConfirmPage.dataAngebote).toContainText(angebotA);
        await expect(rolleCreationConfirmPage.dataAngebote).toContainText(angebotB);
        await expect(rolleCreationConfirmPage.dataAngebote).toContainText(angebotC);
        await expect(rolleCreationConfirmPage.labelSystemrechte).toHaveText('Systemrechte:');
        await expect(rolleCreationConfirmPage.dataSystemrechte).toContainText(
          systemrechtA + ', ' + systemrechtB + ', ' + systemrechtC
        );
        await expect(rolleCreationConfirmPage.buttonWeitereRolleAnlegen).toBeVisible();
        await expect(rolleCreationConfirmPage.buttonZurueckErgebnisliste).toBeVisible();
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test('Falsche Eingaben bei Bearbeitung überprüfen', { tag: [LONG] }, async () => {
    const roleName: string = 'a'.repeat(201);
    const rolleDetailsView: RolleDetailsViewPage = await test.step('Rolle bearbeiten aufrufen', async () => {
      const menu: MenuPage = await startseite.goToAdministration();
      const rolleManagementView: RolleManagementViewPage = await menu.alleRollenAnzeigen();
      return await rolleManagementView.rolleBearbeiten(landesadminRolle);
    });

    await test.step('leere Pflichtfelder', async () => {
      await rolleDetailsView.buttonRolleBearbeiten.click();

      await rolleDetailsView.rolleForm.rollenname.inputElement.clear();
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toHaveText('Der Rollenname muss ausgewählt werden.');
      await rolleDetailsView.rolleForm.rollenname.inputElement.fill('a');
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toHaveText('');
    });

    await test.step('zu lange Eingaben', async () => {
      await rolleDetailsView.rolleForm.rollenname.inputElement.fill(roleName);
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toHaveText(
        'Der Rollenname darf nicht länger als 200 Zeichen sein.'
      );
    });

    await test.step('ungültige Zeichen', async () => {
      const illegalCharacters: string[] = ['!', '"', '§', '$', '%', '&', '/', '<', '>', '{', '}', '[', ']'];
      for (const char of illegalCharacters) {
        await rolleDetailsView.rolleForm.rollenname.inputElement.fill(char);
        await expect(rolleDetailsView.rolleForm.rollenname.messages.getByText('ungültig')).toBeVisible();
        await expect(rolleDetailsView.rolleForm.rollenname.messages.getByText('ungültig')).toHaveText(
          'Der Rollenname darf keine ungültigen Zeichen beinhalten.'
        );
      }
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test('Versuch eine zugewiesene Rolle zu löschen', { tag: [LONG] }, async () => {
    const rolleDetailsView: RolleDetailsViewPage = await test.step('Rolle bearbeiten aufrufen', async () => {
      const menu: MenuPage = await startseite.goToAdministration();
      const rolleManagementView: RolleManagementViewPage = await menu.alleRollenAnzeigen();
      return await rolleManagementView.rolleBearbeiten(landesadminRolle);
    });
    await test.step('Rolle löschen', async () => {
      await rolleDetailsView.deleteRolle();
      await expect(rolleDetailsView.alert.title).toHaveText('Löschen nicht möglich');
      await expect(rolleDetailsView.alert.text).toHaveText(
        'Die Rolle kann nicht gelöscht werden, da die sie noch Benutzern zugeordnet ist. Nehmen Sie bitte zunächst alle Zuordnungen zurück.'
      );
      await expect(rolleDetailsView.alert.button).toHaveText('Zurück zur Ergebnisliste');
      await expect(rolleDetailsView.textSuccess).toBeHidden();
      await rolleDetailsView.alert.button.click();
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });
});

test.describe('Testet die Anlage einer neuen Rolle', () => {
  let rolleNames: string | undefined = undefined;

  test(
    'Eine neue Rolle anlegen und sicherstellen, dass alle Serviceprovider angezeigt werden und verfügbar sind',
    { tag: [LONG] },
    async () => {
      const rolleCreationView: RolleCreationViewPage = await test.step('Rolle anlegen aufrufen', async () => {
        return await startseite.goToAdministration().then((menu: MenuPage) => menu.rolleAnlegen());
      });

      const rolleCreationConfirm: {
        rolleCreationConfirmPage: RolleCreationConfirmPage;
        selectedSPs: string[];
      } = await test.step('Rolle mit mehr als 5 SPs anlegen', async () => {
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle('Land Schleswig-Holstein');
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle('Lehr');
        rolleNames = 'Neue Rolle aus Test';
        await rolleCreationView.enterRollenname(rolleNames);
        const theFirstSeven: number[] = Array.from({ length: 7 }, (_: unknown, key: number) => key);
        const selectedItems: string[] = await rolleCreationView.rolleForm.angebote.inputElement.selectByPosition(
          theFirstSeven
        );
        return {
          rolleCreationConfirmPage: await rolleCreationView.createRolle(),
          selectedSPs: selectedItems,
        };
      });

      const rolleManagementPage: RolleManagementViewPage = await test.step('Anlage prüfen und zurück', async () => {
        const { rolleCreationConfirmPage } = rolleCreationConfirm;
        await expect(rolleCreationConfirmPage.confirmationMessage).toBeVisible();
        await expect(rolleCreationView.rolleForm.adminstrationsebene.data).toHaveText('Land Schleswig-Holstein');
        await expect(rolleCreationView.iconSuccess).toBeVisible();
        return rolleCreationConfirmPage.backToResultList();
      });

      await test.step('Rollentabelle prüfen', async () => {
        expect(rolleNames).toBeDefined();
        const row: RoleTableRow = rolleManagementPage.rowByRoleName(rolleNames!);
        await expect(row.locator).toBeVisible();

        const spCell: Locator = row.spCell();
        for (const sp of rolleCreationConfirm.selectedSPs) {
          await expect.soft(spCell).toContainText(sp);
        }
      });
      // #TODO: wait for the last request in the test
      // sometimes logout breaks the test because of interrupting requests
      // logoutViaStartPage = true is a workaround
      logoutViaStartPage = true;
    }
  );

  test('Falsche Eingaben überprüfen', { tag: [LONG] }, async ({}: PlaywrightTestArgs) => {
    const rolleNames: string = 'a'.repeat(201);
    const rolleCreationView: RolleCreationViewPage = await test.step('Rolle anlegen aufrufen', async () => {
      return await startseite.goToAdministration().then((menu: MenuPage) => menu.rolleAnlegen());
    });

    await test.step('leere Pflichtfelder', async () => {
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toHaveText('');
      await expect(rolleCreationView.rolleForm.rollenart.messages).toHaveText('');

      await rolleCreationView.buttonRolleAnlegen.click();

      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toHaveText(
        'Die Administrationsebene muss ausgewählt werden.'
      );
      await expect(rolleCreationView.rolleForm.rollenart.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenart.messages).toHaveText('Die Rollenart muss ausgewählt werden.');

      await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByPosition([0]);
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toHaveText('');
      await rolleCreationView.rolleForm.rollenart.inputElement.selectByPosition([0]);
      await expect(rolleCreationView.rolleForm.rollenart.messages).toHaveText('');

      await expect(rolleCreationView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText(
        'Der Rollenname muss ausgewählt werden.'
      );
      await rolleCreationView.enterRollenname('a');
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText('');
    });

    await test.step('zu lange Eingaben', async () => {
      await rolleCreationView.enterRollenname(rolleNames);
      await expect(rolleCreationView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText(
        'Der Rollenname darf nicht länger als 200 Zeichen sein.'
      );
    });

    await test.step('ungültige Zeichen', async () => {
      const illegalCharacters: string[] = ['!', '"', '§', '$', '%', '&', '/', '<', '>', '{', '}', '[', ']'];
      for (const char of illegalCharacters) {
        await rolleCreationView.enterRollenname(char);
        await expect(rolleCreationView.rolleForm.rollenname.messages.getByText('ungültig')).toBeVisible();
        await expect(rolleCreationView.rolleForm.rollenname.messages.getByText('ungültig')).toHaveText(
          'Der Rollenname darf keine ungültigen Zeichen beinhalten.'
        );
      }
    });
    // #TODO: wait for the last request in the test
    // sometimes logout breaks the test because of interrupting requests
    // logoutViaStartPage = true is a workaround
    logoutViaStartPage = true;
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (rolleNames) {
      const rolleIds: string = await getRolleId(page, rolleNames);
      await deleteRolle(page, rolleIds);
    }
  });
});
