import { APIRequestContext, APIResponse, Page } from '@playwright/test';

/**
 * makeFetchWithPlaywright
 * -----------------------
 * Adapter that allows OpenAPI-generated clients (or any library expecting the native
 * `fetch` Response interface) to work seamlessly with Playwright’s `page.request.fetch`.
 *
 * Why?
 *  - Playwright’s `page.request.fetch` returns an `APIResponse`, which is *not*
 *    compatible with the standard `Response` object returned by native `fetch`.
 *  - The OpenAPI runtime checks properties like `status`, `ok`, `headers.entries()`,
 *    and calls methods like `json()` or `text()`. These don’t exist or behave differently
 *    on `APIResponse`.
 *  - Without this shim, you’ll see errors like:
 *    `_apiResponse$raw2.entries is not a function`
 *
 * What this does:
 *  - Wraps Playwright’s `APIResponse` and exposes it as a minimal `Response`-like object.
 *  - Ensures `status`, `ok`, `statusText`, `headers`, `url`, and body methods
 *    (`text()`, `json()`, `arrayBuffer()`, `blob()`) behave like native fetch.
 *  - Makes the OpenAPI client (or any fetch-based code) think it’s talking to a real `fetch`.
 *
 * Usage:
 *  ```ts
 *  import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
 *  import { Configuration } from './generated';
 *  import { MyApi } from './generated/apis/MyApi';
 *
 *  function createMyApi(page: Page): MyApi {
 *    const config = new Configuration({
 *      basePath: FRONTEND_URL.replace(/\/$/, ''),
 *      fetchApi: makeFetchWithPlaywright(page),
 *    });
 *    return new MyApi(config);
 *  }
 *  ```

 * @param page Playwright Page (provides `page.request.fetch`)
 * @returns A function compatible with the `fetchApi` option in OpenAPI Configuration
 */
export function makeFetchWithPlaywright(page: Page) {
  return async (url: string, init?): Promise<Response> => {
    const playwrightInit: Parameters<APIRequestContext['fetch']>[1] = {
      ...init,
      data: init?.body,
      timeout: 60000, // 1 minute
      maxRetries: 3,
    };

    const resp: APIResponse = await page.request.fetch(url, playwrightInit);

    const headers: Headers = new Headers(resp.headers());

    return {
      ok: resp.ok(),
      status: resp.status(),
      statusText: resp.statusText(),
      url: resp.url(),
      headers,

      text: () => resp.text(),
      json: () => resp.json(),
      arrayBuffer: async () => {
        const buf: Buffer<ArrayBufferLike> = await resp.body();
        return buf;
      },
      blob: async () => {
        const buf: Buffer<ArrayBufferLike> = await resp.body();
        return new Blob([new Uint8Array(buf)]);
      },

      clone: () => {
        throw new Error('clone not implemented');
      },
    } as unknown as Response;
  };
}
