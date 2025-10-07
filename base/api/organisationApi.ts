import { Page, expect, APIResponse } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { Configuration, OrganisationControllerFindOrganizationsRequest, OrganisationenApi, OrganisationResponse } from './generated';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';

interface CreatedOrganisationResponse {
  id: string,
  administriertVon: string,
  zugehoerigZu: string,
  name: string,
  typ: string,
  itslearningEnabled: boolean,
  version: number
}

export function createOrgaApi(page: Page): OrganisationenApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new OrganisationenApi(config);
}

export async function getOrganisationId(page: Page, nameOrganisation: string): Promise<string> {
  
  try {
    const requestParameters: OrganisationControllerFindOrganizationsRequest = {
      name: nameOrganisation
    };
    // Create API instance
    const orgaApi: OrganisationenApi = createOrgaApi(page);

    const organisations: OrganisationResponse[] = await orgaApi.organisationControllerFindOrganizations(requestParameters);

    // Validate we have organisations
    if (!organisations || organisations.length === 0) {
      throw new Error(`No organisations found with name: "${nameOrganisation}"`);
    }

    // Validate first organisation has an ID
    if (!organisations[0] || !organisations[0].id) {
      throw new Error('First organisation in response does not have an ID');
    }

    const orgId: string = organisations[0].id;
    
    return orgId;

  } catch (error) {
    console.error('[ERROR] getOrganisationId failed:', error);
    throw error;
  }
}

export async function deleteKlasse(page: Page, KlasseId: string): Promise<void> {
  const response: APIResponse = await page.request.delete(FRONTEND_URL + `api/organisationen/${KlasseId}/klasse`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(204);
}

export async function getKlasseId(page: Page, Klassennname: string): Promise<string | undefined> {
  const response: APIResponse = await page.request.get(
    FRONTEND_URL +
      `api/organisationen?name=${Klassennname}&excludeTyp=ROOT&excludeTyp=LAND&excludeTyp=TRAEGER&excludeTyp=SCHULE&excludeTyp=ANBIETER&excludeTyp=SONSTIGE%20ORGANISATION%20%2F%20EINRICHTUNG&excludeTyp=UNBESTAETIGT`,
    { failOnStatusCode: false, maxRetries: 3 }
  );
  expect(response.status()).toBe(200);
  const json: APIResponse = await response.json();

  return json[0]?.id;
}

export async function createKlasse(page: Page, schuleId: string, name: string): Promise<string> {
  const response: APIResponse = await page.request.post(FRONTEND_URL + 'api/organisationen/', {
    data: {
      administriertVon: schuleId,
      zugehoerigZu: schuleId,
      name: name,
      typ: 'KLASSE',
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(201);
  const json: CreatedOrganisationResponse = await response.json();
  return json.id;
}