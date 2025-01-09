import { Page, expect } from '@playwright/test';
import { faker } from "@faker-js/faker/locale/de";

export enum OrganisationsTyp {
    ROOT = 'ROOT',
    LAND = 'LAND',
    TRAEGER = 'TRAEGER',
    SCHULE = 'SCHULE',
    KLASSE = 'KLASSE',
    ANBIETER = 'ANBIETER',
    SONSTIGE = 'SONSTIGE ORGANISATION / EINRICHTUNG',
    UNBEST = 'UNBESTAETIGT',
}

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || "";

export async function createSchule(page: Page, name: string): Promise<string> {
    const response = await page.request.post(FRONTEND_URL + 'api/organisationen/',  {
        data: {
            "administriertVon": null,
            "zugehoerigZu": null,
            "kennung": faker.string.numeric({length: 6}),
            "name": name,
            "namensergaenzung": null,
            "kuerzel": null,
            "typ": OrganisationsTyp.SCHULE,
            "traegerschaft": null
        },
        failOnStatusCode: false,
        maxRetries: 3
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return json.id;
}

export async function createKlasse(page: Page, name: string, administriertVon: string, zugehoerigZu: string): Promise<string> {
    const response = await page.request.post(FRONTEND_URL + 'api/organisationen/',  {
        data: {
            "administriertVon": administriertVon,
            "zugehoerigZu": zugehoerigZu,
            "kennung": faker.string.numeric({length: 6}),
            "name": name,
            "namensergaenzung": null,
            "kuerzel": null,
            "typ": OrganisationsTyp.KLASSE,
            "traegerschaft": null
        },
        failOnStatusCode: false,
        maxRetries: 3
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return json.id;
}

export async function getOrganisationId(page: Page, nameOrganisation: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/organisationen?name=${nameOrganisation}`, {failOnStatusCode: false, maxRetries: 3});
    expect(response.status()).toBe(200);
    const json = await response.json();
    return json[0].id;
}

export async function deleteKlasse(page: Page, klasseId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/organisationen/${klasseId}/klasse`, {failOnStatusCode: false, maxRetries: 3});
    expect(response.status()).toBe(204);
}

export async function getKlasseId(page: Page, klassennname: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/organisationen?name=${klassennname}&excludeTyp=ROOT&excludeTyp=LAND&excludeTyp=TRAEGER&excludeTyp=SCHULE&excludeTyp=ANBIETER&excludeTyp=SONSTIGE%20ORGANISATION%20%2F%20EINRICHTUNG&excludeTyp=UNBESTAETIGT`, {failOnStatusCode: false, maxRetries: 3});
    expect(response.status()).toBe(200);
    const json = await response.json();
    return json[0].id;
}