import { chromium, APIResponse, Browser, BrowserContext, Page } from '@playwright/test';

import FromAnywhere from '../pages/FromAnywhere';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';

import {
  ApiResponse,
  OrganisationenApi,
  OrganisationResponse,
  OrganisationsTyp,
} from '../base/api/generated';
import { constructOrganisationApi } from '../base/api/organisationApi';

const FRONTEND_URL: string = process.env.FRONTEND_URL ?? '';
const searchString: string = 'TAuto';

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

    await FromAnywhere(page)
      .start()
      .then((landing: LandingPage) => landing.goToLogin())
      .then((login: LoginPage) => login.login())
      .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());

    // ---------------------------------------------------------------------
    // PERSONEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Personen löschen');

    const personenResponse: APIResponse = await page.request.get(
      `${FRONTEND_URL}api/personen-frontend?suchFilter=${searchString}`
    );

    const personenJson: { items: { person: { id: string } }[] } =
      await personenResponse.json();

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

    const klassen = await klassenResponse.value();

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

    const schulen = await schulenResponse.value();

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
