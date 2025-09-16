import { Page, expect, APIResponse } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export interface ServiceProviderFromRolleResponse {
  id: string,
  name: string
}

interface ServiceProvider {
  id: string,
  name: string,
  target: string,
  url: string,
  kategorie: string,
  hasLogo: boolean,
  requires2fa: boolean,
  merkmale: string[]
}

type ServiceProviders = ServiceProvider[];

export async function getServiceProviderId(page: Page, serviceProviderName: string): Promise<string> {
  const response: APIResponse = await page.request.get(FRONTEND_URL + `api/provider/all`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);

  const json: ServiceProviders = await response.json();
  let idSP: string = '';
  json.forEach((element: ServiceProvider) => {
    if (element.name === serviceProviderName) {
      idSP = element.id;
    }
  });
  return idSP;
}
