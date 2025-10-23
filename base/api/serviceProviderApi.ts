import { expect, Page } from '@playwright/test';
import { ProviderApi } from './generated/apis/ProviderApi';
import { ApiResponse, Configuration } from './generated/runtime';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
import { ServiceProviderResponse } from './generated/models';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export interface ServiceProviderFromRolleResponse {
  id: string,
  name: string
}

export function constructProviderApi(page: Page): ProviderApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new ProviderApi(config);
}

export async function getServiceProviderId(page: Page, serviceProviderName: string): Promise<string> {
  try {
    const providerApi: ProviderApi = constructProviderApi(page);
    const response: ApiResponse<ServiceProviderResponse[]> = await providerApi.providerControllerGetAllServiceProvidersRaw();
    await expect(response.raw.status).toBe(200);

    const fetchedServiceProviders: ServiceProviderResponse[] = await response.value();
    let serviceProviderId: string = '';

    for (const value of fetchedServiceProviders) {
      if (value.name === serviceProviderName) {
        serviceProviderId = value.id;
      }
    }

    return serviceProviderId;
  } catch (error) {
    console.error('[ERROR] getServiceProviderId failed:', error);
    throw error;
  }
}
