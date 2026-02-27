import test, { PlaywrightTestArgs } from '@playwright/test';
import { createKlasse, createSchule } from '../../base/api/organisationApi';
import { createPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { landSH } from '../../base/organisation';
import {
  landesadminRolle,
  lehrerImVorbereitungsdienstRolle,
  lehrkraftOeffentlichRolle,
  schuelerRolle,
  schuladminOeffentlichRolle,
} from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { loginAndNavigateToAdministration } from '../../base/testHelperUtils';
import {
  generateDienststellenNr,
  generateKlassenname,
  generateKopersNr,
  generateNachname,
  generateSchulname,
  generateVorname,
} from '../../base/utils/generateTestdata';
import { LandingViewPage } from '../../pages/LandingView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { PersonCreationSuccessPage } from '../../pages/admin/personen/creation/PersonCreationSuccess.page';
import {
  PersonCreationParams,
  PersonCreationViewPage,
} from '../../pages/admin/personen/creation/PersonCreationView.neu.page';

test.describe(`Testfälle für die Anlage von Personen`, () => {
  test.describe(`Als ${landesadminRolle}`, () => {
    let schuleId: string;
    let schuleName: string;
    let schuleDstNr: string;
    let personCreationViewPage: PersonCreationViewPage;

    test.describe(`Schulspezifische Rollen anlegen`, () => {
      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        const personManagementViewPage: PersonManagementViewPage = await loginAndNavigateToAdministration(page);
        schuleName = generateSchulname();
        schuleDstNr = generateDienststellenNr();
        schuleId = await createSchule(page, schuleName, schuleDstNr);
        personCreationViewPage = await personManagementViewPage.getMenu().navigateToPersonCreation();
      });

      [schuladminOeffentlichRolle, lehrkraftOeffentlichRolle, lehrerImVorbereitungsdienstRolle, schuelerRolle].forEach(
        (userRolle: string) => {
          test(`${userRolle} anlegen`, { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
            const isSchueler: boolean = userRolle === schuelerRolle;
            const isLehrer: boolean =
              userRolle === lehrerImVorbereitungsdienstRolle || userRolle === lehrkraftOeffentlichRolle;
            let klasseName: string;
            if (isSchueler) {
              await test.step('Klasse anlegen', async () => {
                klasseName = generateKlassenname();
                await createKlasse(page, schuleId, klasseName);
              });
            }

            const creationParameters: PersonCreationParams = {
              nachname: generateNachname(),
              vorname: generateVorname(),
              rollen: [userRolle],
              organisation: schuleName,
              dstNr: schuleDstNr,
            };
            await test.step('Formular ausfüllen', async () => {
              if (isSchueler) {
                creationParameters.klasse = klasseName;
              }
              if (isLehrer) {
                creationParameters.kopersnr = generateKopersNr();
              }
              await personCreationViewPage.fillForm(creationParameters);
            });
            const successPage: PersonCreationSuccessPage = await test.step('Abschicken', async () =>
              personCreationViewPage.submit());
            const { benutzername, startpasswort }: { benutzername: string; startpasswort: string } =
              await test.step('Erfolgsmeldung prüfen', async () => {
                await successPage.checkSuccessfulCreation(creationParameters);
                return {
                  benutzername: await successPage.getBenutzername(),
                  startpasswort: await successPage.getPassword(),
                };
              });
            const personManagementViewPage: PersonManagementViewPage =
              await test.step('Zurück zur Personenübersicht', async () =>
                successPage.getMenu().navigateToPersonManagement());
            await test.step('Neuen Benutzer in Übersicht prüfen', async () => {
              await personManagementViewPage.searchByText(benutzername);
              await personManagementViewPage.checkIfPersonExists(benutzername);
            });
            const landingPage: LandingViewPage = await test.step('Abmelden', async () => {
              return personManagementViewPage.getHeader().logout();
            });
            await test.step('Einloggen mit neu angelegtem Benutzer', async () => {
              const loginPage: LoginViewPage = await landingPage.navigateToLogin();
              const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(
                benutzername,
                startpasswort,
              );
              await startPage.serviceProvidersAreLoaded();
            });
          });
        },
      );
    });

    test.describe(`Landesspezifische Rollen anlegen`, () => {
      let personCreationViewPage: PersonCreationViewPage;
      test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
        const personManagementViewPage: PersonManagementViewPage = await loginAndNavigateToAdministration(page);
        personCreationViewPage = await personManagementViewPage.getMenu().navigateToPersonCreation();
      });

      test(`${landesadminRolle} anlegen`, { tag: [DEV, STAGE] }, async () => {
        const creationParameters: PersonCreationParams = {
          nachname: generateNachname(),
          vorname: generateVorname(),
          rollen: [landesadminRolle],
          organisation: landSH,
        };
        await test.step('Formular ausfüllen', async () => {
          await personCreationViewPage.fillForm(creationParameters);
        });
        const successPage: PersonCreationSuccessPage = await test.step('Abschicken', async () =>
          personCreationViewPage.submit());
        const benutzername: string = await test.step('Erfolgsmeldung prüfen', async () => {
          await successPage.checkSuccessfulCreation(creationParameters);
          return successPage.getBenutzername();
        });
        const personManagementViewPage: PersonManagementViewPage =
          await test.step('Zurück zur Personenübersicht', async () =>
            successPage.getMenu().navigateToPersonManagement());
        await test.step('Neuen Benutzer in Übersicht prüfen', async () => {
          await personManagementViewPage.searchByText(benutzername);
          await personManagementViewPage.checkIfPersonExists(benutzername);
        });
      });
    });
  });

  test.describe(`Als ${schuladminOeffentlichRolle}`, () => {
    let schuleId: string;
    let schuleName: string;
    let schuleDstNr: string;
    let klasseName: string;
    let adminUserInfo: UserInfo;
    let personCreationViewPage: PersonCreationViewPage;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const personManagementViewPage: PersonManagementViewPage = await loginAndNavigateToAdministration(page);
      schuleName = generateSchulname();
      schuleDstNr = generateDienststellenNr();
      klasseName = generateKlassenname();
      schuleId = await createSchule(page, schuleName, schuleDstNr);
      await createKlasse(page, schuleId, klasseName);
      adminUserInfo = await createPersonWithPersonenkontext(page, schuleName, schuladminOeffentlichRolle);
      personCreationViewPage = await personManagementViewPage
        .getHeader()
        .logout()
        .then((landingPage: LandingViewPage) => landingPage.navigateToLogin())
        .then((loginPage: LoginViewPage) =>
          loginPage.loginNewUserWithPasswordChange(adminUserInfo.username, adminUserInfo.password),
        )
        .then((startPage: StartViewPage) => startPage.navigateToAdministration())
        .then((adminViewPage: PersonManagementViewPage) => adminViewPage.getMenu().navigateToPersonAdd());
    });

    test(`${schuelerRolle} anlegen`, { tag: [DEV, STAGE] }, async () => {
      const creationParameters: PersonCreationParams = {
        nachname: generateNachname(),
        vorname: generateVorname(),
        rollen: [schuelerRolle],
        organisation: schuleName,
        dstNr: schuleDstNr,
        klasse: klasseName,
      };
      await test.step('Formular ausfüllen', async () => {
        await personCreationViewPage.fillForm(creationParameters);
      });
      const successPage: PersonCreationSuccessPage = await test.step('Abschicken', async () =>
        personCreationViewPage.submit());
      const { benutzername, startpasswort }: { benutzername: string; startpasswort: string } =
        await test.step('Erfolgsmeldung prüfen', async () => {
          await successPage.checkSuccessfulCreation(creationParameters);
          return {
            benutzername: await successPage.getBenutzername(),
            startpasswort: await successPage.getPassword(),
          };
        });
      const personManagementViewPage: PersonManagementViewPage =
        await test.step('Zurück zur Personenübersicht', async () => successPage.getMenu().navigateToPersonManagement());
      await test.step('Neuen Benutzer in Übersicht prüfen', async () => {
        await personManagementViewPage.searchByText(benutzername);
        await personManagementViewPage.checkIfPersonExists(benutzername);
      });
      const landingPage: LandingViewPage = await test.step('Abmelden', async () => {
        return personManagementViewPage.getHeader().logout();
      });
      await test.step('Einloggen mit neu angelegtem Benutzer', async () => {
        const loginPage: LoginViewPage = await landingPage.navigateToLogin();
        const startPage: StartViewPage = await loginPage.loginNewUserWithPasswordChange(benutzername, startpasswort);
        await startPage.serviceProvidersAreLoaded();
      });
    });
  });
});
