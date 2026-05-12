import { Page } from '@playwright/test';
import { RollenSystemRechtEnum } from '../../base/api/generated/models/RollenSystemRechtEnum';
import { ROLLEN_CASES } from '../../base/rollen';
import { DEV, STAGE } from '../../base/tags';
import { MenuBarPage } from '../../pages/components/MenuBar.page';
import { prepareAndLoginUserWithPermissions } from '../helpers/prepareAndLoginUserWithPermissions';
import { test } from '../fixtures';
import { MENU_TEST_CASES } from './menu.test-cases';

ROLLEN_CASES.forEach((rolle: { name: string; permissions: RollenSystemRechtEnum[] }) => {
  test.describe(`MenuBar – ${rolle.name}`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/admin/personen', { waitUntil: 'load' });
      await prepareAndLoginUserWithPermissions(page, rolle.permissions);
    });

    test('Sichtbarkeit und Navigation der Menueeintraege', { tag: [DEV, STAGE] }, async ({ page }: { page: Page }) => {
      const menu: MenuBarPage = new MenuBarPage(page);

      for (const item of MENU_TEST_CASES) {
        await test.step(`${item.name}`, async () => {
          const previousUrl: string = page.url();
          const locator = page.getByTestId(item.testId);
          const shouldBeVisible: boolean = item.requiredPermissions.every((p: RollenSystemRechtEnum) =>
            rolle.permissions.includes(p),
          );

          await menu.assertMenuItemVisibility(locator, shouldBeVisible);

          if (!shouldBeVisible) {
            return;
          }

          await menu.navigateToMenuItem(item.navigate);
          await menu.assertCurrentRoute(item.route);

          // Restore admin page if navigation left the admin area (e.g. back-to-start link)
          if (!page.url().includes('/admin')) {
            await page.goto(previousUrl);
            await page.waitForLoadState();
          }
        });
      }
    });
  });
});
