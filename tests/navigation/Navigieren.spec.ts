import test, { expect, Locator, Page } from '@playwright/test';
import { MenuBarPage } from '../../pages/components/MenuBar.neu.page';
import { MENU_TEST_CASES } from './menu.test-cases';
import { RollenSystemRecht } from '../../base/api/generated/models/RollenSystemRecht';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { freshLoginPage } from '../../base/api/personApi';
import { prepareAndLoginUserWithPermissions } from '../helpers/prepareAndLoginUserWithPermissions';
import { ROLLEN_CASES } from '../../base/rollen';

ROLLEN_CASES.forEach((rolle: {
  name: string;
  permissions: RollenSystemRecht[];
}) => {
  test.describe(
    `MenuBar – ${rolle.name}: ENV=${process.env.ENV}`,
    () => {
      test.beforeEach(async ({ page }: { page: Page }) => {

        const loginPage: LoginViewPage = await freshLoginPage(page);
        await loginPage.login(process.env.USER!, process.env.PW!);

        await prepareAndLoginUserWithPermissions(page, rolle.permissions);

      });

      test('Menu Sichtbarkeit und Navigation', async ({ page }: { page: Page }) => {
        const menu: MenuBarPage = new MenuBarPage(page);

        for (const item of MENU_TEST_CASES) {
          const locator: Locator = page.getByTestId(item.testId);
          const shouldBeVisible: boolean = item.requiredPermissions.every(
            (p: RollenSystemRecht) => rolle.permissions.includes(p),
          );

          if (shouldBeVisible) {
            await expect(locator).toBeVisible();
            await item.navigate(menu);
            await expect(page).toHaveURL(new RegExp(`${item.route}$`));
          } else {
            await expect(locator).toHaveCount(0);
          }
        }
      });
    },
  );
});
