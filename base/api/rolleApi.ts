import { Page, expect, APIResponse } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';

export async function createRolle(
  page: Page,
  rollenArt: string,
  organisationId: string,
  rolleName: string,
  merkmaleName?: string[]
): Promise<string> {
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
  }

  const requestData: RolleRequestData = {
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

  if (merkmaleName) {
    requestData.data['merkmale'] = merkmaleName;
  } else {
    requestData.data['merkmale'] = [];
  }

  const response: APIResponse = await page.request.post(FRONTEND_URL + 'api/rolle/', requestData);
  expect(response.status()).toBe(201);
  const json = await response.json();
  return json.id;
}