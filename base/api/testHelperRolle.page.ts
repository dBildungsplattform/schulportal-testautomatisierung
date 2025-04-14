import { Page, expect } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export async function createRolle(
  page: Page,
  rollenArt: string,
  organisationId: string,
  rolleName: string,
  merkmalelName?: string[]
): Promise<string> {
  let requestData: RolleRequestData;

  interface RolleRequestData {
    data: {
      name: string;
      administeredBySchulstrukturknoten: string;
      rollenart: string;
      systemrechte: string[];
      version: number;
      merkmale?: string[];
    };
    failOnStatusCode: boolean;
    maxRetries: number;
  };

  requestData = {
    data: {
      name: rolleName,
      administeredBySchulstrukturknoten: organisationId,
      rollenart: rollenArt,
      systemrechte: [],
      version: 1,
    },
    failOnStatusCode: false,
    maxRetries: 3,
  };

  if (merkmalelName) {
    requestData.data['merkmale'] = merkmalelName;
  } else {
    requestData.data['merkmale'] = [];
  }

  const response = await page.request.post(FRONTEND_URL + 'api/rolle/', requestData);
  expect(response.status()).toBe(201);
  const json = await response.json();
  return json.id;
}

export async function addSPToRolle(page: Page, rolleId: string, idSPs: string[]): Promise<void> {
  const response = await page.request.put(FRONTEND_URL + `api/rolle/${rolleId}/serviceProviders`, {
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
  const response = await page.request.patch(FRONTEND_URL + `api/rolle/${rolleId}`, {
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
  const response = await page.request.delete(FRONTEND_URL + `api/rolle/${RolleId}`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  console.log(await response.text())
  expect(response.status()).toBe(204);
}

export async function getRolleId(page: Page, Rollenname: string): Promise<string> {
  const response = await page.request.get(FRONTEND_URL + `api/rolle?searchStr=${Rollenname}`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);
  const json = await response.json();
  return json[0].id;
}
