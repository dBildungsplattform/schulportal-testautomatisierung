import { Page, expect } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { CreateRolleBodyParams, RollenArt, RollenMerkmal, RollenSystemRecht, RolleResponse, RolleWithServiceProvidersResponse, ServiceProviderResponse } from './generated/models';
import { RolleApi, RolleControllerAddSystemRechtRequest, RolleControllerCreateRolleRequest, RolleControllerDeleteRolleRequest, RolleControllerFindRollenRequest, RolleControllerUpdateServiceProvidersByIdRequest } from './generated/apis/RolleApi';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
import { ApiResponse, Configuration } from './generated/runtime';

export { RollenArt };
export { RollenMerkmal };

export function constructRolleApi(page: Page): RolleApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new RolleApi(config);
}

export async function createRolle(
  page: Page,
  rollenArt: RollenArt,
  organisationId: string,
  rolleName: string,
  merkmale?: Set<RollenMerkmal>
): Promise<string> {
  try {
    const createRolleBodyParams: CreateRolleBodyParams = {
      name: rolleName,
      administeredBySchulstrukturknoten: organisationId,
      rollenart: rollenArt,
      merkmale: new Set<RollenMerkmal>(),
      systemrechte: new Set<RollenSystemRecht>(),
    };

    if (merkmale) {
      createRolleBodyParams.merkmale = new Set(merkmale);
    }

    const requestParameters: RolleControllerCreateRolleRequest = {
      createRolleBodyParams,
    };

    const rolleApi: RolleApi = constructRolleApi(page);
    const response: ApiResponse<RolleResponse> = await rolleApi.rolleControllerCreateRolleRaw(requestParameters);
    await expect(response.raw.status).toBe(201);

    const createdRolle: RolleResponse = await response.value();
    return createdRolle.id;
  } catch (error) {
    console.error('[ERROR] createRolle failed:', error);
    throw error;
  }
}

export async function addServiceProvidersToRolle(page: Page, rolleId: string, serviceProviderIds: string[]): Promise<void> {
  try {
    const requestParameters: RolleControllerUpdateServiceProvidersByIdRequest = {
      rolleId,
      rolleServiceProviderBodyParams: {
        serviceProviderIds: serviceProviderIds,
        version: 1,
      }
    }

    const rolleApi: RolleApi = constructRolleApi(page);
    const response: ApiResponse<ServiceProviderResponse[]> = await rolleApi.rolleControllerUpdateServiceProvidersByIdRaw(requestParameters);
    await expect(response.raw.status).toBe(201);

    const addedServiceProviders: ServiceProviderResponse[] = await response.value();
    expect(addedServiceProviders.length).toBe(serviceProviderIds.length);
  } catch (error) {
    console.error('[ERROR] addServiceProvidersToRolle failed:', error);
    throw error;
  }
}

export async function addSystemrechtToRolle(page: Page, rolleId: string, systemRecht: RollenSystemRecht): Promise<void> {
  try {
    const requestParameters: RolleControllerAddSystemRechtRequest = {
      rolleId,
      addSystemrechtBodyParams: {
        systemRecht,
      }
    }

    const rolleApi: RolleApi = constructRolleApi(page);
    const response: ApiResponse<void> = await rolleApi.rolleControllerAddSystemRechtRaw(requestParameters);
    await expect(response.raw.status).toBe(200);
  } catch (error) {
    console.error('[ERROR] addSystemrechtToRolle failed:', error);
    throw error;
  }
}

export async function deleteRolle(page: Page, rolleId: string): Promise<void> {
  try {
    const requestParameters: RolleControllerDeleteRolleRequest = {
      rolleId
    }

    const rolleApi: RolleApi = constructRolleApi(page);
    const response: ApiResponse<void> = await rolleApi.rolleControllerDeleteRolleRaw(requestParameters);
    await expect(response.raw.status).toBe(204);
  } catch (error) {
    console.error('[ERROR] deleteRolle failed:', error);
    throw error;
  }
}

export async function getRolleId(page: Page, rollenname: string): Promise<string> {
  try {
    const requestParameters: RolleControllerFindRollenRequest = {
      searchStr: rollenname
    }

    const rolleApi: RolleApi = constructRolleApi(page);
    const response: ApiResponse<RolleWithServiceProvidersResponse[]> = await rolleApi.rolleControllerFindRollenRaw(requestParameters);
    await expect(response.raw.status).toBe(200);

    const fetchedRollen: RolleWithServiceProvidersResponse[] = await response.value();
    let fetchedRolleId: string = '';

    for (const rolle of fetchedRollen) {
      if (rolle.name === rollenname) {
        fetchedRolleId = rolle.id;
      }
    }

    return fetchedRolleId;
  } catch (error) {
    console.error('[ERROR] getRolleId failed:', error);
    throw error;
  }
}