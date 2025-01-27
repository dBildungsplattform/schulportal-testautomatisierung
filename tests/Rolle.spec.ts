import { expect, test } from '@playwright/test';
import { deleteRolle, getRolleId } from '../base/api/testHelperRolle.page';
import { ersatzLandSH, landSH } from '../base/organisation';
import { landesadminRolle } from '../base/rollen';
import { email, itslearning, kalender, schulportaladmin } from '../base/sp';
import { LONG, SHORT, STAGE } from '../base/tags';
import { deleteRolleByName } from '../base/testHelperDeleteTestdata';
import { generateRolleName } from '../base/testHelperGenerateTestdataNames';
import { RolleCreationConfirmPage } from '../pages/admin/RolleCreationConfirm.page';
import { RolleCreationViewPage } from '../pages/admin/RolleCreationView.page';
import { RolleDetailsViewPage } from '../pages/admin/RolleDetailsView.page';
import { RolleManagementViewPage } from '../pages/admin/RolleManagementView.page';
import FromAnywhere from '../pages/FromAnywhere';
import { HeaderPage } from '../pages/Header.page';
import { MenuPage } from '../pages/MenuBar.page';
import { StartPage } from '../pages/StartView.page';

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
    if (rolleName) {
      // nur wenn der Testfall auch mind. eine Rolle angelegt hat
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

test.describe(`Testfälle für die Administration von Rollen: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test(
    '2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async ({ page }) => {
      const rollenname1 = await generateRolleName();
      const rollenname2 = await generateRolleName();
      const schulstrukturknoten1 = landSH;
      const schulstrukturknoten2 = ersatzLandSH;
      const rollenart1 = 'Lern';
      const rollenart2 = 'Lehr';
      const merkmal2 = 'KoPers.-Nr. ist Pflichtangabe';
      const angebot1 = itslearning;
      const angebotA2 = email;
      const angebotB2 = kalender;

      const rolleCreationView = await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        const rolleCreationView = await startseite.goToAdministration().then((menu) => menu.rolleAnlegen());
        await expect(rolleCreationView.text_h2_RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
        return rolleCreationView;
      });

      await test.step(`Erste Rolle anlegen`, async () => {
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle(schulstrukturknoten1);
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle(rollenart1);
        await rolleCreationView.enterRollenname(rollenname1);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebot1);
        await rolleCreationView.button_RolleAnlegen.click();
        await expect(rolleCreationView.text_success).toBeVisible();
        await expect(rolleCreationView.rolleForm.adminstrationsebene.data).toHaveText(schulstrukturknoten1);
        await expect(rolleCreationView.icon_success).toBeVisible();
        await expect(rolleCreationView.rolleForm.angebote.data).toHaveText(angebot1);
        rolleName.push(rollenname1);
      });

      await test.step(`Zweite Rolle anlegen`, async () => {
        await rolleCreationView.button_WeitereRolleAnlegen.click();
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle(schulstrukturknoten2);
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle(rollenart2);
        await rolleCreationView.enterRollenname(rollenname2);
        await rolleCreationView.rolleForm.merkmale.inputElement.selectByTitle(merkmal2);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotA2);
        await rolleCreationView.rolleForm.angebote.inputElement.selectByTitle(angebotB2);
        await rolleCreationView.button_RolleAnlegen.click();
        await expect(rolleCreationView.text_success).toBeVisible();
        await expect(rolleCreationView.rolleForm.adminstrationsebene.data).toHaveText(schulstrukturknoten2);
        await expect(rolleCreationView.icon_success).toBeVisible();
        await expect(rolleCreationView.rolleForm.angebote.data).toContainText(angebotA2);
        await expect(rolleCreationView.rolleForm.angebote.data).toContainText(angebotB2);
        rolleName.push(rollenname2);
      });

      await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
        const rolleManagementView = await rolleCreationView.menu().alleRollenAnzeigen();
        await expect(rolleManagementView.text_h2_Rollenverwaltung).toHaveText('Rollenverwaltung');
        await expect(page.getByRole('cell', { name: rollenname1 })).toBeVisible();
        await expect(page.getByRole('cell', { name: rollenname2 })).toBeVisible();
      });
    }
  );

  test('Ergebnisliste Rollen auf Vollständigkeit prüfen als Landesadmin', { tag: [LONG, SHORT, STAGE] }, async () => {
    await test.step(`Rollenverwaltung öffnen und alle Elemente in der Ergebnisliste auf Existenz prüfen`, async () => {
      const menu: MenuPage = await startseite.goToAdministration();
      const rolleManagement = await menu.alleRollenAnzeigen();
      await expect(rolleManagement.text_h1_Administrationsbereich).toBeVisible();
      await expect(rolleManagement.text_h2_Rollenverwaltung).toBeVisible();
      await expect(rolleManagement.table_header_Rollenname).toBeVisible();
      await expect(rolleManagement.table_header_Rollenart).toBeVisible();
      await expect(rolleManagement.table_header_Merkmale).toBeVisible();
      await expect(rolleManagement.table_header_Administrationsebene).toBeVisible();
    });
  });

  test(
    'Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen als Landesadmin',
    { tag: [LONG, SHORT, STAGE] },
    async () => {
      const rollenname = await generateRolleName();
      const administrationsebene = landSH;
      const rollenart = 'Leit';
      const merkmal = 'KoPers.-Nr. ist Pflichtangabe';
      const angebotA = email;
      const angebotB = schulportaladmin;
      const angebotC = kalender;
      const systemrechtA = 'Darf Benutzer verwalten';
      const systemrechtB = 'Darf Schulen verwalten';
      const systemrechtC = 'Darf Klassen verwalten';

      const rolleCreationView = await test.step(`Dialog Rolle anlegen öffnen`, async () => {
        return await startseite.goToAdministration().then((menu) => menu.rolleAnlegen());
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
        await expect(rolleCreationConfirmPage.text_h2_RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
        await expect(rolleCreationConfirmPage.button_Schliessen).toBeVisible();
        await expect(rolleCreationConfirmPage.text_success).toBeVisible();
        rolleName.push(rollenname);
        await expect(rolleCreationConfirmPage.text_DatenGespeichert).toHaveText('Folgende Daten wurden gespeichert:');
        await expect(rolleCreationConfirmPage.label_Administrationsebene).toHaveText('Administrationsebene:');
        await expect(rolleCreationConfirmPage.data_Administrationsebene).toHaveText(administrationsebene);
        await expect(rolleCreationConfirmPage.label_Rollenart).toHaveText('Rollenart:');
        await expect(rolleCreationConfirmPage.data_Rollenart).toHaveText(rollenart);
        await expect(rolleCreationConfirmPage.label_Rollenname).toHaveText('Rollenname:');
        await expect(rolleCreationConfirmPage.data_Rollenname).toHaveText(rollenname);
        await expect(rolleCreationConfirmPage.label_Merkmale).toHaveText('Merkmale:');
        await expect(rolleCreationConfirmPage.data_Merkmale).toHaveText(merkmal);
        await expect(rolleCreationConfirmPage.label_Angebote).toHaveText('Zugeordnete Angebote:');
        await expect(rolleCreationConfirmPage.data_Angebote).toContainText(angebotA);
        await expect(rolleCreationConfirmPage.data_Angebote).toContainText(angebotB);
        await expect(rolleCreationConfirmPage.data_Angebote).toContainText(angebotC);
        await expect(rolleCreationConfirmPage.label_Systemrechte).toHaveText('Systemrechte:');
        await expect(rolleCreationConfirmPage.data_Systemrechte).toContainText(
          systemrechtA + ', ' + systemrechtB + ', ' + systemrechtC
        );
        await expect(rolleCreationConfirmPage.button_WeitereRolleAnlegen).toBeVisible();
        await expect(rolleCreationConfirmPage.button_ZurueckErgebnisliste).toBeVisible();
      });
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
      await rolleDetailsView.button_RolleBearbeiten.click();

      await rolleDetailsView.rolleForm.rollenname.inputElement.clear();
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toHaveText('Der Rollenname muss ausgewählt werden.');
      await rolleDetailsView.rolleForm.rollenname.inputElement.fill('a');
      await expect(rolleDetailsView.rolleForm.rollenname.messages).toHaveText("");
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
      illegalCharacters.forEach(async (input: string) => {
        await rolleDetailsView.rolleForm.rollenname.inputElement.fill(input);
        await expect(rolleDetailsView.rolleForm.rollenname.messages.getByText('ungültig')).toBeVisible();
        await expect(rolleDetailsView.rolleForm.rollenname.messages.getByText('ungültig')).toHaveText(
          'Der Rollenname darf keine ungültigen Zeichen beinhalten.'
        );
      });
    });
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
      await expect(rolleDetailsView.text_success).toBeHidden();
      await rolleDetailsView.alert.button.click();
    });
  });
});

test.describe('Testet die Anlage einer neuen Rolle', () => {
  let roleName: string | undefined = undefined;

  test(
    'Eine neue Rolle anlegen und sicherstellen, dass alle Serviceprovider angezeigt werden und verfügbar sind',
    { tag: [LONG] },
    async () => {
      const rolleCreationView: RolleCreationViewPage = await test.step('Rolle anlegen aufrufen', async () => {
        return await startseite.goToAdministration().then((menu) => menu.rolleAnlegen());
      });

      const rolleCreationConfirm: {
        rolleCreationConfirmPage: RolleCreationConfirmPage;
        selectedSPs: string[];
      } = await test.step('Rolle mit mehr als 5 SPs anlegen', async () => {
        await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByTitle('Land Schleswig-Holstein');
        await rolleCreationView.rolleForm.rollenart.inputElement.selectByTitle('Lehr');
        roleName = 'Neue Rolle aus Test';
        await rolleCreationView.enterRollenname(roleName);
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
        await expect(rolleCreationView.icon_success).toBeVisible();
        return rolleCreationConfirmPage.backToResultList();
      });

      await test.step('Rollentabelle prüfen', async () => {
        expect(roleName).toBeDefined();
        const row = rolleManagementPage.rowByRoleName(roleName!);
        await expect(row.locator).toBeVisible();

        const spCell = row.spCell();
        for (const sp of rolleCreationConfirm.selectedSPs) {
          await expect.soft(spCell).toContainText(sp);
        }
      });
    }
  );

  test('Falsche Eingaben überprüfen', { tag: [LONG] }, async () => {
    const roleName: string = 'a'.repeat(201);
    const rolleCreationView: RolleCreationViewPage = await test.step('Rolle anlegen aufrufen', async () => {
      return await startseite.goToAdministration().then((menu) => menu.rolleAnlegen());
    });

    await test.step('leere Pflichtfelder', async () => {
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toBeHidden();
      await expect(rolleCreationView.rolleForm.rollenart.messages).toBeHidden();

      await rolleCreationView.button_RolleAnlegen.click();

      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toHaveText(
        'Die Administrationsebene muss ausgewählt werden.'
      );
      await expect(rolleCreationView.rolleForm.rollenart.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenart.messages).toHaveText('Die Rollenart muss ausgewählt werden.');

      await rolleCreationView.rolleForm.adminstrationsebene.inputElement.selectByPosition([0]);
      await expect(rolleCreationView.rolleForm.adminstrationsebene.messages).toHaveText("");
      await rolleCreationView.rolleForm.rollenart.inputElement.selectByPosition([0]);
      await expect(rolleCreationView.rolleForm.rollenart.messages).toHaveText("");

      await expect(rolleCreationView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText(
        'Der Rollenname muss ausgewählt werden.'
      );
      await rolleCreationView.enterRollenname('a');
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText("");
    });

    await test.step('zu lange Eingaben', async () => {
      await rolleCreationView.enterRollenname(roleName);
      await expect(rolleCreationView.rolleForm.rollenname.messages).toBeVisible();
      await expect(rolleCreationView.rolleForm.rollenname.messages).toHaveText(
        'Der Rollenname darf nicht länger als 200 Zeichen sein.'
      );
    });

    await test.step('ungültige Zeichen', async () => {
      const illegalCharacters: string[] = ['!', '"', '§', '$', '%', '&', '/', '<', '>', '{', '}', '[', ']'];
      illegalCharacters.forEach(async (input: string) => {
        await rolleCreationView.enterRollenname(input);
        await expect(rolleCreationView.rolleForm.rollenname.messages.getByText('ungültig')).toBeVisible();
        await expect(rolleCreationView.rolleForm.rollenname.messages.getByText('ungültig')).toHaveText(
          'Der Rollenname darf keine ungültigen Zeichen beinhalten.'
        );
      });
    });
  });

  test.afterEach(async ({ page }) => {
    if (roleName) {
      const roleId = await getRolleId(page, roleName);
      await deleteRolle(page, roleId);
    }
  });
});
