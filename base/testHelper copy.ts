import { Page } from '@playwright/test';
import {faker} from "@faker-js/faker/locale/de";
import {LandingPage} from "../pages/LandingView.page";
import {LoginPage} from "../pages/LoginView.page";
import {HeaderPage} from "../pages/Header.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
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
    const json = await response.json();
    return json.id;
}

export async function createRolle(page: Page, rollenArt: string, organisationId: string, rolleName?: string): Promise<string> {
    const response = await page.request.post(FRONTEND_URL + 'api/rolle/', {
        data: {
            "name": rolleName,
            "administeredBySchulstrukturknoten": organisationId,
            "rollenart": rollenArt,
            "merkmale": [
            ],
            "systemrechte": [
            ]
        }
    });
    const json = await response.json();
    return json.id;
}

export async function addSPToRolle(page: Page, rolleId: string, idSP: string): Promise<void> {
    const response = await page.request.post(FRONTEND_URL + `api/rolle/${rolleId}/serviceProviders`, {
        data: {
            "serviceProviderId": idSP,
        }
    });
}

export async function addSystemrechtToRolle(page: Page, rolleId: string, systemrecht: string): Promise<void> {
    const response = await page.request.patch(FRONTEND_URL + `api/rolle/${rolleId}`, {
        data: {
            "systemRecht": systemrecht
        }
    });
}

export async function createUser(page: Page, familienname: string, vorname: string, organisationId: string, rolleId: string): Promise<UserInfo> {
    const response = await page.request.post(FRONTEND_URL + 'api/personenkontext-workflow/', {
        data: {
            "familienname": familienname,
            "vorname": vorname,
            "organisationId": organisationId,
            "rolleId": rolleId
        }
    });
    const json = await response.json();
    return {
        username: json.person.referrer,
        password: json.person.startpasswort,
        rolleId: rolleId,
        organisationId: organisationId,
        personId: json.person.id
    }
}

export async function createBenutzerWithUserContext(page: Page, organisationName: string, rollenArt: string, familienname: string, vorname: string, idSP: string, rolleName: string): Promise<UserInfo> {
    // Sich mit dem Admin-User anmelden, damit die API-Calls auch Authorized sind und funktionieren:
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Header = new HeaderPage(page);

    if (await Header.button_logout.isVisible()) { //Abmelden, falls noch ein Nutzer aus einem vorherigen Test angemeldet ist:
        await Header.button_logout.click();
    }
    await page.goto(FRONTEND_URL);
    await Landing.button_Anmelden.click();
    await Login.login(ADMIN, PW);

    // API-Calls machen:
    const organisationId: string = await createOrganisation(page, organisationName);
    const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName);
    await addSPToRolle(page, rolleId, idSP);
    const userInfo: UserInfo = await createUser(page, familienname, vorname, organisationId, rolleId);
    await addSystemrechtToRolle(page, rolleId, 'PERSONEN_VERWALTEN');
    await Header.button_logout.click();
    console.log(userInfo);
    return userInfo;
}

export async function getSPId(page: Page, nameSP: string): Promise<string> {
    // Service-Provider-Ids auslesen
    const Landing = new LandingPage(page);
    const Login = new LoginPage(page);
    const Header = new HeaderPage(page);

    await page.goto(FRONTEND_URL);
    await Landing.button_Anmelden.click();
    await Login.login(ADMIN, PW);
    
    let idSP = '';
    const response_provider = await page.waitForResponse((response) =>
        response.url().includes("/api/provider")
    );

    const responseBody_provider = await response_provider.json();
    responseBody_provider.forEach((element) => {
        if (element.name === nameSP) {
            idSP = element.id
        }
    });
    
    await Header.button_logout.click();
    return idSP;   
}

export async function deletePersonen(page: Page, personId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/personen/${personId}`, {});
}

export async function deleteRolle(page: Page, RolleId: string): Promise<void> {
    const response = await page.request.delete(FRONTEND_URL + `api/rollen/${RolleId}`, {});
}



