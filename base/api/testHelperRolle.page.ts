import { APIResponse, expect, Page } from "@playwright/test";

const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

export async function createRolle(
  page: Page,
  rollenArt: string,
  organisationId: string,
  rolleName?: string,
): Promise<string> {
  const response: APIResponse = await page.request.post(
    FRONTEND_URL + "api/rolle/",
    {
      data: {
        name: rolleName,
        administeredBySchulstrukturknoten: organisationId,
        rollenart: rollenArt,
        merkmale: [],
        systemrechte: [],
      },
    },
  );
  expect(response.status()).toBe(201);
  const json: { id: string } = await response.json();
  return json.id;
}

export async function addSPToRolle(
  page: Page,
  rolleId: string,
  idSP: string,
): Promise<void> {
  const response: APIResponse = await page.request.post(
    FRONTEND_URL + `api/rolle/${rolleId}/serviceProviders`,
    {
      data: {
        serviceProviderId: idSP,
      },
    },
  );
  expect(response.status()).toBe(201);
}

export async function addSystemrechtToRolle(
  page: Page,
  rolleId: string,
  systemrecht: string,
): Promise<void> {
  const response: APIResponse = await page.request.patch(
    FRONTEND_URL + `api/rolle/${rolleId}`,
    {
      data: {
        systemRecht: systemrecht,
      },
    },
  );
  expect(response.status()).toBe(200);
}

export async function deleteRolle(page: Page, RolleId: string): Promise<void> {
  const response: APIResponse = await page.request.delete(
    FRONTEND_URL + `api/rolle/${RolleId}`,
    {},
  );
  expect(response.status()).toBe(204);
}

export async function getRolleId(
  page: Page,
  Rollenname: string,
): Promise<string> {
  const response: APIResponse = await page.request.get(
    FRONTEND_URL + `api/rolle?searchStr=${Rollenname}`,
    {},
  );
  expect(response.status()).toBe(200);
  const json: { id: string }[] = await response.json();
  return json[0]!.id;
}
