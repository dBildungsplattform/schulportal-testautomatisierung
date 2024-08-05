import { Page, expect } from '@playwright/test';
import { faker } from "@faker-js/faker/locale/de";

const FRONTEND_URL = process.env.FRONTEND_URL || "";

export async function createOrganisation(page: Page, name: string): Promise<string> {
    const response = await page.request.post(FRONTEND_URL + 'api/organisationen/', {
        data: {
            "administriertVon": null,
            "zugehoerigZu": null,
            "kennung": faker.string.numeric({length: 6}),
            "name": name,
            "namensergaenzung": null,
            "kuerzel": null,
            "typ": "SCHULE",
            "traegerschaft": null
        }
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return json.id;
}

export async function getOrganisationId(page: Page, nameOrganisation: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/organisationen?name=${nameOrganisation}`, {});  
    expect(response.status()).toBe(200); 
    const json = await response.json(); 
    return json[0].id;
}