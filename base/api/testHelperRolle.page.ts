import { Page, expect, APIResponse } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

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
  const json = await response.json();
  return json[0].id;
}
