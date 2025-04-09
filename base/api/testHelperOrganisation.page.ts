import { Page, expect, APIResponse } from '@playwright/test';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

export async function getOrganisationId(page: Page, nameOrganisation: string): Promise<string> {
    const response: APIResponse = await page.request.get(FRONTEND_URL + `api/organisationen?name=${nameOrganisation}`, {failOnStatusCode: false, maxRetries: 3});  
    expect(response.status()).toBe(200); 
    const json: APIResponse = await response.json(); 
    return json[0].id;
}

export async function deleteKlasse(page: Page, KlasseId: string): Promise<void> {
    const response: APIResponse = await page.request.delete(FRONTEND_URL + `api/organisationen/${KlasseId}/klasse`, {failOnStatusCode: false, maxRetries: 3});
    expect(response.status()).toBe(204);
}

export async function getKlasseId(page: Page, Klassennname: string): Promise<string> {
    const response: APIResponse = await page.request.get(FRONTEND_URL + `api/organisationen?name=${Klassennname}&excludeTyp=ROOT&excludeTyp=LAND&excludeTyp=TRAEGER&excludeTyp=SCHULE&excludeTyp=ANBIETER&excludeTyp=SONSTIGE%20ORGANISATION%20%2F%20EINRICHTUNG&excludeTyp=UNBESTAETIGT`, {failOnStatusCode: false, maxRetries: 3});  
    expect(response.status()).toBe(200); 
    const json: APIResponse = await response.json(); 
    return json[0].id;
  } catch {
    return '';
  }
}

export async function createKlasse(page: Page, idSchule: string, name: string): Promise<string> {
    const response: APIResponse = await page.request.post(FRONTEND_URL + 'api/organisationen/',  {
        data: {
            "administriertVon": idSchule,
            "zugehoerigZu": idSchule,
            "name": name,
            "typ": "KLASSE"
        },
        failOnStatusCode: false, 
        maxRetries: 3
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return json.id;
}
