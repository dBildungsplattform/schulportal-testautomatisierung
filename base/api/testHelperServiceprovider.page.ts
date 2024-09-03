import { APIResponse, expect, Page } from "@playwright/test";

const FRONTEND_URL: string = process.env["FRONTEND_URL"] || "";

export async function getSPId(page: Page, nameSP: string): Promise<string> {
  const response: APIResponse = await page.request.get(
    FRONTEND_URL + `api/provider/all`,
    {},
  );
  expect(response.status()).toBe(200);
  const json: { name: string; id: string }[] = await response.json();
  expect(response.status()).toBe(200);
  let idSP: string = "";

  json.forEach((element: { name: string; id: string }) => {
    if (element.name === nameSP) {
      idSP = element.id;
    }
  });
  return idSP;
}
