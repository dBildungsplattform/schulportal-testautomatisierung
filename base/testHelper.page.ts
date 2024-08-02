import { Page, expect } from '@playwright/test';
import {faker} from "@faker-js/faker/locale/de";

const FRONTEND_URL = process.env.FRONTEND_URL || "";

export interface UserInfo {
    username: string,
    password: string,
    rolleId: string,
    organisationId: string,
    personId: string;
}

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

export async function createRolle(page: Page, rollenArt: string, organisationId: string, rolleName?: string): Promise<string> {
    const response = await page.request.post(FRONTEND_URL + 'api/rolle/', {
        data: {
            "name": rolleName,
            "administeredBySchulstrukturknoten": organisationId,
            "rollenart": rollenArt,
            "merkmale": [],
            "systemrechte": []
        }
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return json.id;
}

export async function addSPToRolle(page: Page, rolleId: string, idSP: string): Promise<void> {
    const response = await page.request.post(FRONTEND_URL + `api/rolle/${rolleId}/serviceProviders`, {
        data: {
            "serviceProviderId": idSP
        }
    });
    expect(response.status()).toBe(201);
}

export async function addSystemrechtToRolle(page: Page, rolleId: string, systemrecht: string): Promise<void> {
    const response = await page.request.patch(FRONTEND_URL + `api/rolle/${rolleId}`, {
        data: {
            "systemRecht": systemrecht
        }
    });
    expect(response.status()).toBe(200);
}

export async function createPerson(page: Page, familienname: string, vorname: string, organisationId: string, rolleId: string): Promise<UserInfo> {
    const response = await page.request.post(FRONTEND_URL + 'api/personenkontext-workflow/', {
        data: {
            "familienname": familienname,
            "vorname": vorname,
            "organisationId": organisationId,
            "rolleId": rolleId
        }
    });
    expect(response.status()).toBe(201);
    const json = await response.json();
    return {
        username: json.person.referrer,
        password: json.person.startpasswort,
        rolleId: rolleId,
        organisationId: organisationId,
        personId: json.person.id
    }
}

export async function createPersonWithUserContext(page: Page, organisationName: string, rollenArt: string, familienname: string, vorname: string, idSP: string, rolleName: string): Promise<UserInfo> {
    // API-Calls machen und Benutzer mit Kontext anlegen
    const organisationId: string = await getOrganisationId(page, organisationName);
    const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName);
    await addSPToRolle(page, rolleId, idSP);
    const userInfo: UserInfo = await createUser(page, familienname, vorname, organisationId, rolleId);
    return userInfo;
}

export async function getSPId(page: Page, nameSP: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/provider/all`, {});   
    expect(response.status()).toBe(200);
    const json = await response.json(); 
    expect(response.status()).toBe(200);
    let idSP = '';
    
    json.forEach((element) => {
        if (element.name === nameSP) {
            idSP = element.id;
        }
    });
    return idSP;   
}

export async function getOrganisationId(page: Page, nameOrganisation: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/organisationen?name=${nameOrganisation}`, {});  
    expect(response.status()).toBe(200); 
    const json = await response.json(); 
    return json[0].id;
}

export async function deletePersonen(page: Page, personId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/personen/${personId}`, {});
    expect(response.status()).toBe(204);
}

export async function deleteRolle(page: Page, RolleId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/rolle/${RolleId}`, {});
    expect(response.status()).toBe(204);
}