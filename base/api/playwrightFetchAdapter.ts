import { APIRequestContext, APIResponse, Page } from '@playwright/test';
import { FetchAPI } from './generated';
import { constructAuthApi, getCsrfToken } from './authApi';

type PlaywrightFetchInit = Parameters<APIRequestContext['fetch']>[1];

/**
 * CSRF cached per adapter instance
 */
let csrfToken: string | undefined;
let csrfPromise: Promise<string | undefined> | undefined;

/**
 * Resolve CSRF using your AuthApi (OpenAPI-based)
 */
async function resolveCsrf(page: Page): Promise<string | undefined> {
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = (async (): Promise<string | undefined> => {
      const authApi = constructAuthApi(page);
      csrfToken = await getCsrfToken(authApi);
      return csrfToken;
    })();
  }

  return csrfPromise;
}

/**
 * Playwright OpenAPI fetch adapter with automatic CSRF injection
 */
export function makeFetchWithPlaywright(page: Page): FetchAPI {
  return async (url: string, init?: RequestInit & PlaywrightFetchInit): Promise<Response> => {
    const token = await resolveCsrf(page);

    const playwrightInit: PlaywrightFetchInit = {
      ...init,
      data: init?.body,
      maxRetries: 3,

      headers: {
        ...(init?.headers as Record<string, string>),
        ...(token ? { 'X-CSRF-Token': token } : {}),
      },
    };

    const resp: APIResponse = await page.request.fetch(url, playwrightInit);

    const headers = new Headers(resp.headers());

    if (!resp.ok()) {
      console.log(`[API ERROR] ${resp.status()} ${url}`);
      try {
        console.log(await resp.json());
      } catch {
        console.log(await resp.text());
      }
    }

    return {
      ok: resp.ok(),
      status: resp.status(),
      statusText: resp.statusText(),
      url: resp.url(),
      headers,

      text: () => resp.text(),
      json: () => resp.json(),
      arrayBuffer: async () => resp.body(),
      blob: async () => new Blob([new Uint8Array(await resp.body())]),

      clone: () => {
        throw new Error('clone not implemented');
      },
    } as unknown as Response;
  };
}
