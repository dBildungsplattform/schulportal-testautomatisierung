/* eslint-disable no-console */

import { Browser, BrowserContext, chromium, Page } from '@playwright/test';

import { ApiResponse, OrganisationenApi, OrganisationResponse, OrganisationsTyp, PersonenApi, PersonendatensatzResponse, PersonenFrontendApi, PersonFrontendControllerFindPersons200Response, RolleApi, RolleWithServiceProvidersResponse } from '../base/api/generated';
import { constructOrganisationApi } from '../base/api/organisationApi';
import { loginAndNavigateToAdministration } from '../base/testHelperUtils';
import { constructPersonenApi, constructPersonenFrontendApi } from '../base/api/personApi';
import { constructRolleApi } from '../base/api/rolleApi';

const FRONTEND_URL: string = process.env.FRONTEND_URL ?? '';
const searchString: string = 'TAuto';
const limit: number = 100;
const batchSize: number = 20;

async function cleanup<T>(get: () => Promise<T[]>, del: (item: T) => Promise<void>): Promise<void> {
  let items: T[] = await get();
  do {
    for (const promise of getBatchedDelPromise(items, del)) {
      await promise;
    }
    items = await get();
  } while (items.length > 0)
}

function* getBatchedDelPromise<T>(arr: T[], del: (item: T) => Promise<void>): Generator<Promise<PromiseSettledResult<void>[]>> {
  for (let start = 0; start < arr.length; start += batchSize) {
    yield Promise.allSettled(arr.slice(start, start + batchSize).map(del))
  }
}

/**
 * Global teardown – runs ONCE per Playwright run
 */
export default async function globalTeardown(): Promise<void> {
  console.log('Global teardown started');

  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    baseURL: FRONTEND_URL,
    ignoreHTTPSErrors: true,
  });

  const page: Page = await context.newPage();

  try {
    const personApi: PersonenApi = constructPersonenApi(page);
    const personFrontendApi: PersonenFrontendApi = constructPersonenFrontendApi(page);
    const rolleApi: RolleApi = constructRolleApi(page);
    const organisationApi: OrganisationenApi = constructOrganisationApi(page);

    // ---------------------------------------------------------------------
    // LOGIN
    // ---------------------------------------------------------------------
    console.log('Login');
    await loginAndNavigateToAdministration(page, process.env.USER!, process.env.PW!);

    // ---------------------------------------------------------------------
    // PERSONEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Personen löschen');

    await cleanup(
      async () => {
        const resp: PersonFrontendControllerFindPersons200Response = await personFrontendApi.personFrontendControllerFindPersons({
          suchFilter: searchString,
          limit,
        });
        console.log(`${resp.total} personen to delete`)
        return resp.items;
      },
      async (item: PersonendatensatzResponse) => await personApi.personControllerDeletePersonById({ personId: item.person.id }),
    );

    // ---------------------------------------------------------------------
    // ROLLEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Rollen löschen');

    await cleanup(
      async () => {
        const wrappedResponse: ApiResponse<RolleWithServiceProvidersResponse[]> = await rolleApi.rolleControllerFindRollenRaw({
          searchStr: searchString,
          limit,
        });
        console.log(`${wrappedResponse.raw.headers.get('X-Paging-Total')} rollen to delete`);
        return wrappedResponse.value();
      },
      async (item: RolleWithServiceProvidersResponse) => await rolleApi.rolleControllerDeleteRolle({ rolleId: item.id })
    );

    // ---------------------------------------------------------------------
    // KLASSEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Klassen löschen');

    await cleanup(
      async () => {
        const wrappedResponse: ApiResponse<OrganisationResponse[]> = await organisationApi.organisationControllerFindOrganizationsRaw({
          searchString,
          typ: OrganisationsTyp.Klasse,
          limit,
        });
        console.log(`${wrappedResponse.raw.headers.get('X-Paging-Total')} klassen to delete`)
        return wrappedResponse.value()
      },
      async (item: OrganisationResponse) => organisationApi.organisationControllerDeleteOrganisation({ organisationId: item.id }),
    );

    // ---------------------------------------------------------------------
    // SCHULEN LÖSCHEN
    // ---------------------------------------------------------------------
    console.log('Schulen löschen');

    await cleanup(
      async () => {
        const wrappedResponse: ApiResponse<OrganisationResponse[]> = await organisationApi.organisationControllerFindOrganizationsRaw({
          searchString,
          typ: OrganisationsTyp.Schule,
          limit,
        });
        console.log(`${wrappedResponse.raw.headers.get('X-Paging-Total')} schulen to delete`)
        return wrappedResponse.value();
      },
      async (item: OrganisationResponse) => organisationApi.organisationControllerDeleteOrganisation({ organisationId: item.id }),
    );

    console.log('Global teardown finished successfully');
  } catch (error) {
    console.error('Global teardown failed', error);
    throw error;
  } finally {
    await browser.close();
  }
}
