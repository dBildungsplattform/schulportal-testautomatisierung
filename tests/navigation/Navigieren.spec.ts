import test, { Page } from '@playwright/test';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';
import { MENU_TEST_CASES } from './menu.test-cases';
import { RollenSystemRechtEnum } from '../../base/api/generated/models/RollenSystemRechtEnum';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { freshLoginPage } from '../../base/api/personApi';
import { prepareAndLoginUserWithPermissions } from '../helpers/prepareAndLoginUserWithPermissions';
import { ROLLEN_CASES } from '../../base/rollen';
import { SMOKE } from '../../base/tags';

ROLLEN_CASES.forEach((rolle: { name: string; permissions: RollenSystemRechtEnum[] }) => {
  test.describe(`MenuBar – ${rolle.name}`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      const loginPage: LoginViewPage = await freshLoginPage(page);
      await loginPage.login(process.env.USER!, process.env.PW!);

      await prepareAndLoginUserWithPermissions(page, rolle.permissions);
    });

    test('Sichtbarkeit und Navigation der Menueeintraege', { tag: [SMOKE] }, async ({ page }: { page: Page }) => {
      const menu: MenuBarPage = new MenuBarPage(page);

      for (const item of MENU_TEST_CASES) {
        await test.step(`${item.name}`, async () => {
          const locator = page.getByTestId(item.testId);
          const shouldBeVisible: boolean = item.requiredPermissions.every((p: RollenSystemRechtEnum) =>
            rolle.permissions.includes(p),
          );

          await menu.checkMenuItemVisibility(locator, shouldBeVisible, item.navigate, item.route);
        });
      }
    });
  });
});
