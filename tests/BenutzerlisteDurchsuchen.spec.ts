import { test, expect, type Page, PlaywrightTestArgs } from '@playwright/test';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';
import { freshLoginPage } from '../base/api/personApi';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.neu.page';

const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;
let loginPage: LoginViewPage;
let personManagementView: PersonManagementViewPage;

test.describe('Testfälle für das Anlegen von Benutzern', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      // 1. Anmelden im Schulportal SH
      loginPage = await freshLoginPage(page);
      const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
      await startPage.waitForPageLoad();

        // 2. Zur Benutzerverwaltung navigieren
      personManagementView = await startPage.goToAdministration();
  });

  test('Rollenfilter zeigt 0 Rollen gefunden bei unzulässigem Begriff', async ({ page }: {page: Page}) => {
  // 3. Im Rollenfilter einen unzulässigen Begriff eingeben
  const unzulaessig: string = 'xyz_unerlaubt';
  await personManagementView.filterByRolle(unzulaessig);

  // 4. Erwartetes Ergebnis prüfen: 0 Rollen gefunden
  await expect(page.getByText('0 Rollen gefunden')).toBeVisible();
  });
});