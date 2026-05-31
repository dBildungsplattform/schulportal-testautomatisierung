import { Page } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { ApiResponse, AuthApi, Configuration } from './generated';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';

export function constructAuthApi(page: Page): AuthApi {
  return new AuthApi(
    new Configuration({
      basePath: FRONTEND_URL?.replace(/\/$/, ''),
      fetchApi: makeFetchWithPlaywright(page, { withCsrf: false }), // disable CSRF for auth API
    }),
  );
}
export async function getCsrfToken(authApi: AuthApi): Promise<string> {
  const response: ApiResponse<{ csrfToken: string }> = await authApi.authenticationControllerGetCsrfTokenRaw();

  const data = await response.value();

  if (!data.csrfToken) {
    throw new Error('CSRF token missing');
  }

  return data.csrfToken;
}
