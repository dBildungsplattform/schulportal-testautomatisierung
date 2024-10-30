import { Page, expect } from '@playwright/test';
import { getOrganisationId } from "./testHelperOrganisation.page";
import { createRolle, addSPToRolle } from "./testHelperRolle.page";
import { UserInfo } from "./testHelper.page";

const FRONTEND_URL = process.env.FRONTEND_URL || "";

export async function createPerson(page: Page, familienname: string, vorname: string, organisationId: string, rolleId: string): Promise<UserInfo> {
    const response = await page.request.post(FRONTEND_URL + 'api/personenkontext-workflow/', {
        data: {
            "familienname": familienname,
            "vorname": vorname,
            "createPersonenkontexte": [
                {
                    "organisationId": organisationId,
                    "rolleId": rolleId
                }
            ]     
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
    // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
    // API-Calls machen und Benutzer mit Kontext anlegen
    const organisationId: string = await getOrganisationId(page, organisationName);
    const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName);
    await addSPToRolle(page, rolleId, idSP);
    const userInfo: UserInfo = await createPerson(page, familienname, vorname, organisationId, rolleId);
    return userInfo;
}

export async function addSecondOrganisationToPerson(page: Page, personId: string, organisationId1: string, organisationId2: string, rolleId: string) {
    const response = await page.request.put(FRONTEND_URL + 'api/personenkontext-workflow/' + personId, {
        data: {
            "lastModified":"2034-09-11T08:28:36.590Z",
            "count": 1,
            "personenkontexte":
            [
                {
                    "personId": personId,
                    "organisationId": organisationId1,
                    "rolleId": rolleId
                },
                {
                    "personId": personId,
                    "organisationId": organisationId2,
                    "rolleId": rolleId
                }
            ]
        }
    });
    expect(response.status()).toBe(200);
}

export async function deletePersonen(page: Page, personId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/personen/${personId}`, {});
    expect(response.status()).toBe(204);
}

export async function getPersonId(page: Page, Benutzername: string): Promise<string> {
    const response = await page.request.get(FRONTEND_URL + `api/personen-frontend?suchFilter=${Benutzername}`, {});  
    expect(response.status()).toBe(200); 
    const json = await response.json(); 
    return json.items[0].person.id;
}

export async function lockPerson(page: Page, personId: string, organisationId: string): Promise<void> {
    const response = await page.request.put(FRONTEND_URL + `api/personen/${personId}/lock-user`, {
        data: {
            "lock": true,
            "locked_by": organisationId
        }
    });
    expect(response.status()).toBe(202);
}