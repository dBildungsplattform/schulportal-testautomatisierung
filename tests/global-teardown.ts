import { APIResponse, Browser, BrowserContext, chromium, Page } from '@playwright/test';

import {
  ApiResponse,
  OrganisationenApi,
  OrganisationResponse,
  OrganisationsTyp,
} from '../base/api/generated';
import { constructOrganisationApi } from '../base/api/organisationApi';
import FromAnywhere from '../pages/FromAnywhere.neu';
import { LandingViewPage } from '../pages/LandingView.neu.page';
import { LoginViewPage } from '../pages/LoginView.neu.page';
import { StartViewPage } from '../pages/StartView.neu.page';

const FRONTEND_URL: string = process.env.FRONTEND_URL ?? '';
const searchString: string = 'TAuto';
const timeoutMS: number = 2 * 60 * 1000;

/**
 * Global teardown – runs ONCE per Playwright run
 */
export default async function globalTeardown(): Promise<void> {
  console.log('Global teardown started');

  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    baseURL: FRONTEND_URL,
  });

  const page: Page = await context.newPage();

  try {
    const organisationApi: OrganisationenApi = constructOrganisationApi(page);

    // ---------------------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------------------
    console.log('Login');

    const landingPage: LandingViewPage= await FromAnywhere(page).start()
    const loginPage: LoginViewPage = await landingPage.navigateToLogin();
    const startPage: StartViewPage = await loginPage.login(process.env.USER!, process.env.PW!);
    await startPage.waitForPageLoad();
    await startPage.navigateToAdministration();

    // ---------------------------------------------------------------------
    // PERSONEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Personen löschen');

    const personenResponse: APIResponse = await page.request.get(
      `${FRONTEND_URL}api/personen-frontend?suchFilter=${searchString}`
    );

    const personenJson: { items: { person: { id: string } }[] } =
      await personenResponse.json();

    console.log(`Found ${personenJson.items.length} Personen to delete`);

    for (const { person } of personenJson.items) {
      await page.request.delete(`${FRONTEND_URL}api/personen/${person.id}`);
    }

    // ---------------------------------------------------------------------
    // ROLLEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Rollen löschen');

    const rollenResponse: APIResponse = await page.request.get(
      `${FRONTEND_URL}api/rolle?searchStr=${searchString}`
    );

    const rollenJson: { id: string }[] = await rollenResponse.json();

    console.log(`Found ${rollenJson.length} Rollen to delete`);

    for (const rolle of rollenJson) {
      await page.request.delete(`${FRONTEND_URL}api/rolle/${rolle.id}`);
    }

    // ---------------------------------------------------------------------
    // KLASSEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Klassen löschen');

    const klassenResponse: ApiResponse<OrganisationResponse[]> =
      await organisationApi.organisationControllerFindOrganizationsRaw({
        searchString,
        typ: OrganisationsTyp.Klasse,
      });

    const klassen: Array<OrganisationResponse> = await klassenResponse.value();

    console.log(`Found ${klassen.length} Klassen to delete`);

    await Promise.allSettled(
      klassen.map(({ id }) =>
        organisationApi.organisationControllerDeleteOrganisationRaw({ organisationId: id })
      )
    );

    // ---------------------------------------------------------------------
    // SCHULEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Schulen löschen');

    const schulenResponse: ApiResponse<OrganisationResponse[]> =
      await organisationApi.organisationControllerFindOrganizationsRaw({
        searchString,
        typ: OrganisationsTyp.Schule,
      });

    const schulen: Array<OrganisationResponse> = await schulenResponse.value();
    console.log(`Found ${schulen.length} Schulen to delete`);

    await Promise.allSettled(
      schulen.map(({ id }) =>
        organisationApi.organisationControllerDeleteOrganisationRaw({ organisationId: id })
      )
    );

    console.log('Global teardown finished successfully');
  } catch (error) {
    console.error('Global teardown failed', error);
    throw error;
  } finally {
    await browser.close();
  }
}
