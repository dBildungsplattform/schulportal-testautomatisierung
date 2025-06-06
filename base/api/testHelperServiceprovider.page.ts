import { Page, expect, APIResponse } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export async function getSPId(page: Page, nameSP: string): Promise<string> {
  const response: APIResponse = await page.request.get(FRONTEND_URL + `api/provider/all`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);

  const json = await response.json();
  let idSP: string = '';
  json.forEach((element) => {
    if (element.name === nameSP) {
      idSP = element.id;
    }
  });
  return idSP;
}
