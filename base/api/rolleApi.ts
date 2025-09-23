import { Page, expect, APIResponse } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { ApiResponse } from './generated';
import { RolleApi, RolleControllerCreateRolleRequest } from './generated/apis/RolleApi';
import { CreateRolleBodyParams, RollenArt, RollenMerkmal, RollenSystemRecht, RolleResponse } from './generated/models';

const rolleApi: RolleApi = new RolleApi();

export async function createRolle(
  page: Page,
  rollenArt: RollenArt,
  organisationId: string,
  rolleName: string,
  merkmale?: RollenMerkmal[]
): Promise<string> {
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
    createRolleBodyParams
  };

  // const response: APIResponse = await page.request.post(FRONTEND_URL + 'api/rolle/', createRolleBodyParams);
  const response: ApiResponse<RolleResponse> = await rolleApi.rolleControllerCreateRolleRaw(requestParameters);
  expect(response.raw.status).toBe(201);
  const json = await response.value();
  return json.id;
}

export async function addSPToRolle(page: Page, rolleId: string, idSPs: string[]): Promise<void> {
  const response: APIResponse = await page.request.put(FRONTEND_URL + `api/rolle/${rolleId}/serviceProviders`, {
    data: {
      serviceProviderIds: idSPs,
      version: 1,
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });

  expect(response.status()).toBe(201);
}

export async function addSystemrechtToRolle(page: Page, rolleId: string, systemrecht: string): Promise<void> {
  const response: APIResponse = await page.request.patch(FRONTEND_URL + `api/rolle/${rolleId}`, {
    data: {
      systemRecht: systemrecht,
      version: 1,
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);
}

export async function deleteRolle(page: Page, RolleId: string): Promise<void> {
  const response: APIResponse = await page.request.delete(FRONTEND_URL + `api/rolle/${RolleId}`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(204);
}

export async function getRolleId(page: Page, Rollenname: string): Promise<string> {
  const response: APIResponse = await page.request.get(FRONTEND_URL + `api/rolle?searchStr=${Rollenname}`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);
  const json: RolleResponse = await response.json();
  return json[0].id;
}