import { PlaywrightTestArgs, test } from '@playwright/test';
import { freshLoginPage } from '../../base/api/personApi';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { RolleCreationParams, RolleCreationViewPage } from '../../pages/admin/rollen/RolleCreationView.neu.page';
import { testschuleName } from '../../base/organisation';
import { RolleCreationSuccessPage } from '../../pages/admin/rollen/RolleCreationSuccess.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

test.describe(`Testfälle für die Rollenanlage: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  let loginPage: LoginViewPage;
  let rolleCreationPage: RolleCreationViewPage;

  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    const personManagementView: PersonManagementViewPage = await startPage.navigateToAdministration();
    rolleCreationPage = await personManagementView.menu.navigateToRolleCreation();
  });

  test('Rolle erfolgreich als Landesadmin anlegen', async () => {
    const rolleCreationParams: RolleCreationParams = {
      name: 'Test-Lehrkraft',
      schulname: testschuleName,
      rollenart: 'Lehr',
      merkmale: ['Befristung ist Pflichtangabe', 'KoPers.-Nr. ist Pflichtangabe'],
      systemrechte: [],
      serviceProviders: ['E-Mail', 'itslearning', 'Kalender', 'Adressbuch', 'OP.SH', 'School-SH', 'WebUntis', 'Anleitungen', 'Helpdesk kontaktieren', 'Psychosoziales Beratungsangebot', 'Schulrecht A-Z'],
    };

    const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleCreationParams);
    await rolleCreationSuccessPage.checkSuccessPage(rolleCreationParams);
  });

  test('Rolle erfolgreich als Schuladmin anlegen', async () => {
    const rolleCreationParams: RolleCreationParams = {
      name: 'Test-Schüler',
      schulname: testschuleName,
      rollenart: 'Lern',
      merkmale: [],
      systemrechte: [],
      serviceProviders: ['itslearning', 'WebUntis'],
    };

    await rolleCreationPage.createRolle(rolleCreationParams);

    const rolleCreationSuccessPage: RolleCreationSuccessPage = await rolleCreationPage.createRolle(rolleCreationParams);
    await rolleCreationSuccessPage.checkSuccessPage(rolleCreationParams);
  });

  // TODO: angelegte rolle in ergebnisliste prüfen

  // TODO: angelegte rolle in gesamtübersicht prüfen

  // TODO: rolle mit ungültigen daten anlegen

  // TODO: rolle doppelt anlegen

  // TODO: rolle mit systemrechten anlegen

  // TODO: login mit user und prüfen auf systemrechte und serviceprovider
});