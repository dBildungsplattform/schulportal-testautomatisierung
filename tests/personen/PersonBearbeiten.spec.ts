import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { createPerson, createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { addServiceProvidersToRolle, addSystemrechtToRolle, createRolle, RollenArt } from '../../base/api/rolleApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { klasse1Testschule } from '../../base/klassen';
import { landSH, testschule665Name, testschuleName } from '../../base/organisation';
import { lehrerImVorbereitungsdienstRolle, lehrkraftOeffentlichRolle } from '../../base/rollen';
import { typeLehrer, typeSchuladmin } from '../../base/rollentypen';
import { email } from '../../base/sp';
import { DEV, STAGE } from '../../base/tags';
import {
  deleteKlasseByName,
  deletePersonenBySearchStrings,
  deleteRolleById,
} from '../../base/testHelperDeleteTestdata';
import { gotoTargetURL, loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { PersonDetailsViewPage } from '../../pages/admin/personen/PersonDetailsView.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';
import { getOrganisationId } from '../../base/api/organisationApi';

const ADMIN: string | undefined = process.env.USER;

// The created test data will be deleted in the afterEach block
let usernames: string[] = [];
let rolleIds: string[] = [];
let klasseNames: string[] = [];
// This variable must be set to false in the testcase when the logged in user is changed
const currentUserIsLandesadministrator: boolean = true;

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step(`Login`, async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    if (!currentUserIsLandesadministrator) {
      const header: HeaderPage = new HeaderPage(page);

      await header.logout();
      await loginAndNavigateToAdministration(page);
    }

    await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
      if (usernames.length > 0) {
        await deletePersonenBySearchStrings(page, usernames);
        usernames = [];
      }

      if (rolleIds.length > 0) {
        await deleteRolleById(rolleIds, page);
        rolleIds = [];
      }

      if (klasseNames.length > 0) {
        await deleteKlasseByName(klasseNames, page);
        klasseNames = [];
      }
    });

    await test.step(`Abmelden`, async () => {
      const header: HeaderPage = new HeaderPage(page);
      await header.logout();
    });
  });

  test(
    'Befristung beim hinzufügen von Personenkontexten',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      const unbefristeteRolle: string = lehrkraftOeffentlichRolle;
      const befristeteRolle: string = lehrerImVorbereitungsdienstRolle;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage =
        await test.step(`Zu testenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
          await gotoTargetURL(page, 'admin/personen'); // Die Navigation ist nicht Bestandteil des Tests
          await personManagementView.searchBySuchfeld(userInfoLehrer.username);
          return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
        });

      await test.step(`Ansicht für neuen Personenkontext öffnen`, async () => {
        await personDetailsView.waitForPageToBeLoaded();
        await personDetailsView.buttonEditSchulzuordnung.click();
        await personDetailsView.buttonAddSchulzuordnung.click();
        await personDetailsView.organisationen.searchByTitle(testschuleName, false);
      });

      await test.step(`Befristung bei ${unbefristeteRolle} und ${befristeteRolle} überprüfen`, async () => {
        await personDetailsView.rollen.selectByTitle(befristeteRolle);
        await expect(personDetailsView.buttonBefristetSchuljahresende).toBeChecked();
        await personDetailsView.rollen.clear();
        await personDetailsView.rollen.selectByTitle(unbefristeteRolle);
        await expect(personDetailsView.buttonBefristungUnbefristet).toBeChecked();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schueler öffnen und Unsichtbarkeit des 2FA Abschnitts prüfen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoSchueler: UserInfo;

      await test.step(`Testdaten: Schüler mit einer Rolle(LERN) über die api anlegen ${ADMIN}`, async () => {
        const schuleId: string = await getOrganisationId(page, testschuleName);
        const klasseId: string = await getOrganisationId(page, klasse1Testschule);
        const rollenname: string = generateRolleName();
        const rolleId: string = await createRolle(page, 'LERN', schuleId, rollenname);
        await addServiceProvidersToRolle(page, rolleId, [await getServiceProviderId(page, 'itslearning')]);
        userInfoSchueler = await createPerson(
          page,
          schuleId,
          rolleId,
          generateNachname(),
          generateVorname(),
          '',
          klasseId,
        );
        usernames.push(userInfoSchueler.username);
        rolleIds.push(userInfoSchueler.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoSchueler.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoSchueler.username);
      });

      await test.step(`Gesamtübersicht Abschnitte prüfen`, async () => {
        await expect(personDetailsView.textH2BenutzerBearbeiten).toHaveText('Benutzer bearbeiten');
        await expect(personDetailsView.textH3PasswortHeadline).toBeVisible();
        await expect(personDetailsView.textH3SchulzuordnungHeadline).toBeVisible();
        await expect(personDetailsView.textH3LockPersonHeadline).toBeVisible();
      });

      await test.step(`Unsichtbarkeit des 2FA Abschnitts prüfen`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeHidden();
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeHidden();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeHidden();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeHidden();
        await expect(personDetailsView.button2FAEinrichten).toBeHidden();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Lehrkraft öffnen und 2FA Status prüfen dass kein Token eingerichtet ist',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeVisible();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schuladmin öffnen und 2FA Status prüfen dass kein Token eingerichtet ist',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const adminRollenart: RollenArt = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          adminOrganisation,
          adminRollenart,
          addminVorname,
          adminNachname,
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await expect(personDetailsView.textKeinTokenIstEingerichtet).toBeVisible();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Landesadmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const addminVorname: string = generateVorname();
      const adminNachname: string = generateNachname();
      const organisation: string = landSH;
      const rollenart: RollenArt = 'SYSADMIN';

      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Landesadmin mit einer Rolle(SYSADMIN) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          organisation,
          rollenart,
          addminVorname,
          adminNachname,
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'ROLLEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULTRAEGER_VERWALTEN');
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_ANLEGEN');

        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Schuladmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      const adminRollenart: RollenArt = typeSchuladmin;
      const adminOrganisation: string = testschule665Name;
      let userInfoAdmin: UserInfo;

      await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
        userInfoAdmin = await createRolleAndPersonWithPersonenkontext(
          page,
          adminOrganisation,
          adminRollenart,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        usernames.push(userInfoAdmin.username);
        rolleIds.push(userInfoAdmin.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
    },
  );

  test(
    'Gesamtübersicht für einen Benutzer als Lehrkraft öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;
      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`2FA Token einrichten`, async () => {
        await expect(personDetailsView.textH3TwoFA).toBeVisible();
        await personDetailsView.softwareTokenEinrichten();
      });

      await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
        await expect(personDetailsView.textTokenIstEingerichtetInfo).toBeVisible();
        await expect(personDetailsView.textNeuenTokenEinrichtenInfo).toBeVisible();
      });
    },
  );

  test(
    'Inbetriebnahme-Passwort über die Gesamtübersicht erzeugen',
    { tag: [STAGE, DEV] },
    async ({ page }: PlaywrightTestArgs) => {
      let userInfoLehrer: UserInfo;

      await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen`, async () => {
        userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        usernames.push(userInfoLehrer.username);
        rolleIds.push(userInfoLehrer.rolleId);
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchBySuchfeld(userInfoLehrer.username);
        return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
      });

      await test.step(`Inbetriebnahme-Passwort für LK-Endgerät setzen`, async () => {
        await personDetailsView.createIbnPassword();
      });
    },
  );
});
