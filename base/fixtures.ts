/**
 * Extended Playwright fixtures for cross-browser compatibility.
 *
 * Use this module (`import { test } from '../../base/fixtures'`) instead of `@playwright/test`
 * whenever a spec interacts with animated Vuetify components: `v-dialog` open/close sequences,
 * nested dialogs that mount further overlays (e.g. `v-select` or autocomplete inside a dialog),
 * bulk-operation flows that re-render while an overlay is still animating, or multiple
 * simultaneous `v-overlay`/`v-menu` layers.
 *
 * WebKit sequences CSS animation frames differently from Chromium/Firefox, causing clicks to
 * miss animating elements or actionability checks to time out — flaky only in CI.  The `page`
 * fixture below injects a script at document init that zeroes all transition/animation durations
 * for WebKit only, making Vuetify motion synchronous without affecting other browsers.
 *
 * Specs limited to page navigation or non-animated elements can import directly from
 * `@playwright/test`.
 *
 * Additionally this module provides shared, composable setup fixtures (POC SPSH-3199):
 * - `asLandesadmin`: logs in as the worker's Landesadmin and navigates to the administration.
 * - `testSchule`: creates a fresh test school (requires an authenticated Landesadmin page).
 * - `asSchuladmin`: creates a Schuladmin in `testSchule` and logs in as that user.
 *
 * The fixtures are test-scoped: no shared state across tests and no per-fixture cleanup —
 * global teardown owns the lifecycle of prefixed test data. Compose spec-specific payload
 * (target page objects, angebot params, ...) in a local `test.extend` on top of these.
 */
import { expect, test as base } from '@playwright/test';

import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.page';
import { PersonCreationViewPage } from '../pages/admin/personen/creation/PersonCreationView.page';
import { createKlasse, createSchule } from './api/organisationApi';
import { createPersonWithPersonenkontext, UserInfo } from './api/personApi';
import { schuladminOeffentlichRolle } from './rollen';
import { loginAndNavigateToAdministration, loginNewUserAndNavigateToAdministration } from './testHelperUtils';
import { generateDienststellenNr, generateKlassenname, generateSchulname } from './utils/generateTestdata';

export interface TestSchule {
  id: string;
  name: string;
}

export interface TestSchuleMitDstNr extends TestSchule {
  dstNr: string;
}

export interface TestKlasse {
  id: string;
  name: string;
}

export interface LandesadminFixture {
  personManagementViewPage: PersonManagementViewPage;
}

export interface SchuladminAccount {
  userinfo: UserInfo;
  schule: TestSchule;
}

export interface SchuladminFixture extends SchuladminAccount {
  personManagementViewPage: PersonManagementViewPage;
}

const NO_MOTION_STYLE: string = `
*, *::before, *::after {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
}
`;

const NO_MOTION_STYLE_ID: string = '__pw_no_motion_style__';

export const test = base.extend<{
  asLandesadmin: LandesadminFixture;
  testSchule: TestSchule;
  testSchuleMitDstNr: TestSchuleMitDstNr;
  testKlasse: TestKlasse;
  schuladminAccount: SchuladminAccount;
  asSchuladmin: SchuladminFixture;
  personCreationPage: PersonCreationViewPage;
}>({
  page: async ({ page, browserName }, use) => {
    if (browserName !== 'webkit') {
      await use(page);
      return;
    }

    await page.addInitScript(
      ({ styleId, styleContent }) => {
        const applyNoMotionStyle = (): void => {
          if (document.getElementById(styleId)) {
            return;
          }

          const styleElement: HTMLStyleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.textContent = styleContent;

          const target: HTMLElement | null = document.head ?? document.documentElement;
          target?.append(styleElement);
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyNoMotionStyle, { once: true });
          return;
        }

        applyNoMotionStyle();
      },
      {
        styleId: NO_MOTION_STYLE_ID,
        styleContent: NO_MOTION_STYLE,
      },
    );

    await use(page);
  },

  asLandesadmin: async ({ page }, use) => {
    const personManagementViewPage: PersonManagementViewPage = await loginAndNavigateToAdministration(page);
    await use({ personManagementViewPage });
  },

  testSchule: async ({ page, asLandesadmin: _asLandesadmin }, use) => {
    const name: string = generateSchulname();
    const id: string = await createSchule(page, name);
    await use({ id, name });
  },

  testSchuleMitDstNr: async ({ page, asLandesadmin: _asLandesadmin }, use) => {
    const name: string = generateSchulname();
    const dstNr: string = generateDienststellenNr();
    const id: string = await createSchule(page, name, dstNr);
    await use({ id, name, dstNr });
  },

  testKlasse: async ({ page, testSchule }, use) => {
    const name: string = generateKlassenname();
    const id: string = await createKlasse(page, testSchule.id, name);
    await use({ id, name });
  },

  schuladminAccount: async ({ page, testSchule }, use): Promise<void> => {
    const userinfo: UserInfo = await createPersonWithPersonenkontext(page, testSchule.name, schuladminOeffentlichRolle);
    await use({ userinfo, schule: testSchule });
  },

  asSchuladmin: async ({ page, schuladminAccount }, use): Promise<void> => {
    const personManagementViewPage: PersonManagementViewPage = await loginNewUserAndNavigateToAdministration(
      page,
      schuladminAccount.userinfo,
    );
    await use({ ...schuladminAccount, personManagementViewPage });
  },

  personCreationPage: async ({ asLandesadmin }, use) => {
    const personCreationViewPage: PersonCreationViewPage = await asLandesadmin.personManagementViewPage
      .getMenu()
      .navigateToPersonCreation();
    await use(personCreationViewPage);
  },
});

export { expect };
