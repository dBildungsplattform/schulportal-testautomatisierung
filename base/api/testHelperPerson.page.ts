import { Page, expect } from '@playwright/test';
import { getOrganisationId } from "./testHelperOrganisation.page";
import { createRolle, addSPToRolle, getRolleId } from "./testHelperRolle.page";
import { UserInfo } from "./testHelper.page";
import { HeaderPage } from '../../pages/Header.page';
import { LoginPage } from '../../pages/LoginView.page';
import { faker } from '@faker-js/faker';
import { lehrkraftOeffentlichRolle } from '../roles';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || "";

export async function createPerson(page: Page, familienname: string, vorname: string, organisationId: string, rolleId: string, koPersNr?: string): Promise<UserInfo> {
    const requestData = {
        data: {
            familienname,
            vorname,
            createPersonenkontexte: [
                {
                    organisationId,
                    rolleId
                }
            ]
        }

    };
    if(koPersNr) {
        requestData.data['personalnummer'] = koPersNr;
    }
    const response = await page.request.post(FRONTEND_URL + 'api/personenkontext-workflow/', requestData);
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

export async function createPersonWithUserContext(page: Page, organisationName: string, familienname: string, vorname: string, rolleName: string, koPersNr?: string): Promise<UserInfo> {
    // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
    // API-Calls machen und Benutzer mit Kontext anlegen
    const organisationId: string = await getOrganisationId(page, organisationName);
    const rolleId: string = await getRolleId(page, rolleName);
    const userInfo: UserInfo = await createPerson(page, familienname, vorname, organisationId, rolleId, koPersNr);
    return userInfo;
}

export async function createRolleAndPersonWithUserContext(page: Page, organisationName: string, rollenArt: string, familienname: string, vorname: string, idSP: string, rolleName: string, koPersNr?: string): Promise<UserInfo> {
    // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
    // API-Calls machen und Benutzer mit Kontext anlegen
    const organisationId: string = await getOrganisationId(page, organisationName);
    const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName);
    await addSPToRolle(page, rolleId, idSP);
    const userInfo: UserInfo = await createPerson(page, familienname, vorname, organisationId, rolleId, koPersNr);
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

export async function createTeacherAndLogin(page) {
    const header = new HeaderPage(page);
    const login = new LoginPage(page);
    const vorname = "TAuto-PW-V-" + faker.person.firstName();
    const nachname = "TAuto-PW-N-" + faker.person.lastName();
    const organisation = 'Testschule Schulportal';
    const kopersNr = '0815' + faker.string.numeric({ length: 3 });

    const userInfo: UserInfo = await createPersonWithUserContext(page, organisation, nachname, vorname, lehrkraftOeffentlichRolle, kopersNr);
    await header.logout();
    await header.button_login.click();
    await login.login(userInfo.username, userInfo.password);
    await login.UpdatePW();
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