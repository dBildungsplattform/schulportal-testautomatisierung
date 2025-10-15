import { Page, expect } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { ApiResponse, Configuration } from './generated/runtime';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
import { OrganisationControllerCreateOrganisationRequest, OrganisationControllerDeleteKlasseRequest, OrganisationControllerFindOrganizationsRequest, OrganisationenApi } from './generated/apis/OrganisationenApi';
import { CreateOrganisationBodyParams, OrganisationResponse } from './generated/models';

export function constructOrganisationApi(page: Page): OrganisationenApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new OrganisationenApi(config);
}

export async function getOrganisationId(page: Page, organisationName: string): Promise<string> {
  try {
    const requestParameters: OrganisationControllerFindOrganizationsRequest = {
      name: organisationName
    };

    const organisationApi: OrganisationenApi = constructOrganisationApi(page);
    const response: ApiResponse<OrganisationResponse[]> = await organisationApi.organisationControllerFindOrganizationsRaw(requestParameters);
    await expect(response.raw.status).toBe(200);

    const organisations: OrganisationResponse[] = await response.value();

    if (!organisations || organisations.length === 0) {
      throw new Error(`No organisations found with name: "${organisationName}"`);
    }

    if (!organisations[0] || !organisations[0].id) {
      throw new Error('First organisation in response does not have an ID');
    }

    const fetchedOrganisationId: string = organisations[0].id;
    return fetchedOrganisationId;
  } catch (error) {
    console.error('[ERROR] getOrganisationId failed:', error);
    throw error;
  }
}

export async function deleteKlasse(page: Page, klasseId: string): Promise<void> {
  try {
    const requestParameters: OrganisationControllerDeleteKlasseRequest = {
      organisationId: klasseId
    };

    const organisationApi: OrganisationenApi = constructOrganisationApi(page);
    const response: ApiResponse<void> = await organisationApi.organisationControllerDeleteKlasseRaw(requestParameters);
    await expect(response.raw.status).toBe(204);
  } catch (error) {
    console.error('[ERROR] deleteKlasse failed:', error);
    throw error;
  }
}

export async function getKlasseId(page: Page, klassennname: string): Promise<string | undefined> {
  try {
    const requestParameters: OrganisationControllerFindOrganizationsRequest = {
      name: klassennname,
      excludeTyp: ['ROOT', 'LAND', 'TRAEGER', 'SCHULE', 'ANBIETER', 'SONSTIGE ORGANISATION / EINRICHTUNG', 'UNBESTAETIGT'],
    }

    const organisationApi: OrganisationenApi = constructOrganisationApi(page);
    const response: ApiResponse<OrganisationResponse[]> = await organisationApi.organisationControllerFindOrganizationsRaw(requestParameters);
    await expect(response.raw.status).toBe(200);

    const organisations: OrganisationResponse[] = await response.value();
    if (!organisations || organisations.length === 0) {
      return undefined;
    }

    return organisations[0].id;
  } catch (error) {
    console.error('[ERROR] getKlasseId failed:', error);
    throw error;
  }
}

export async function createKlasse(page: Page, schuleId: string, name: string): Promise<string> {
  try {
    const createOrganisationBodyParams: CreateOrganisationBodyParams = {
      administriertVon: schuleId,
      zugehoerigZu: schuleId,
      name: name,
      typ: 'KLASSE',
    }

    const requestParameters: OrganisationControllerCreateOrganisationRequest = {
      createOrganisationBodyParams,
    }

    const organisationApi: OrganisationenApi = constructOrganisationApi(page);
    const response: ApiResponse<OrganisationResponse> = await organisationApi.organisationControllerCreateOrganisationRaw(requestParameters);
    await expect(response.raw.status).toBe(201);

    const createdKlasse: OrganisationResponse = await response.value();
    return createdKlasse.id;
  } catch (error) {
    console.error('[ERROR] createKlasse failed:', error);
    throw error;
  }
}