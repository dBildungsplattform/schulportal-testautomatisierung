import { Page, expect, APIResponse } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { generateCurrentDate, generateKopersNr, generateNachname, generateRolleName } from '../utils/generateTestdata';
import { generateVorname } from '../utils/generateTestdata';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { befristungPflicht } from '../merkmale';
import { getOrganisationId } from './organisationApi';
import { addSPToRolle, createRolle, getRolleId } from './rolleApi';
import { HeaderPage } from '../../pages/components/Header.page';
import { LoginPage } from '../../pages/LoginView.page';
import { testschuleName } from '../organisation';
import { typeLehrer } from '../rollentypen';
import { getServiceProviderId } from './serviceProviderApi';
import { adressbuch, email, kalender } from '../sp';

export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
}

interface Person {
  id: string,
  referrer: string,
  mandant: string,
  name: {
    familienname: string,
    vorname: string
  },
  revision: string,
  startpasswort: string,
  lastModified: string
}

interface PersonRequestData {
  data: {
    familienname: string;
    vorname: string;
    createPersonenkontexte: {
      organisationId: string;
      rolleId: string;
    }[];
    personalnummer?: string;
    befristung?: string;
  };
  failOnStatusCode: boolean;
  maxRetries: number;
}

interface CreatedPersonResponse {
  person: Person,
  dBiamPersonenkontextResponses: [
    {
      personId: string,
      organisationId: string,
      rolleId: string
    }
  ]
}

interface PersonenFrontendResponse { total: 1, offset: 0, limit: 1, items: [ { person: Person } ] }

export async function freshLoginPage(page: Page): Promise<LoginViewPage> {
  return (await FromAnywhere(page).start()).navigateToLogin();
}

export async function createPerson(
  page: Page,
  organisationId: string,
  rolleId: string,
  familienname?: string,
  vorname?: string,
  koPersNr?: string,
  klasseId?: string,
  merkmalNames?: string[]
): Promise<UserInfo> {
  const requestData: PersonRequestData = {
    data: {
      familienname: familienname || await generateNachname(),
      vorname: vorname || await generateVorname(),
      createPersonenkontexte: [
        {
          organisationId: organisationId,
          rolleId: rolleId,
        },
      ],
    },
    failOnStatusCode: false,
    maxRetries: 3,
  };

  if (klasseId) {
    requestData.data.createPersonenkontexte.push({
      organisationId: klasseId,
      rolleId: rolleId,
    });
  }

  if (koPersNr) {
    requestData.data['personalnummer'] = koPersNr;
  }

  if (merkmalNames) {
    for (const merkmal of merkmalNames) {
      if (merkmal == befristungPflicht) {
        requestData.data.befristung = await generateCurrentDate({ days: 0, months: 6, formatDMY: false });
      }
    }
  }

  const response: APIResponse = await page.request.post(new URL('api/personenkontext-workflow/', FRONTEND_URL).toString(), requestData);
  expect(response.status()).toBe(201);
  const json: CreatedPersonResponse = await response.json();

  return {
    username: json.person.referrer,
    password: json.person.startpasswort,
    rolleId: rolleId,
    organisationId: organisationId,
    personId: json.person.id,
  };
}

export async function lockPerson(page: Page, personId: string, organisationId: string): Promise<void> {
  const response: APIResponse = await page.request.put(FRONTEND_URL + `api/personen/${personId}/lock-user`, {
    data: {
      lock: true,
      locked_by: organisationId,
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(202);
}

export async function createPersonWithUserContext(
  page: Page,
  organisationName: string,
  familienname: string,
  vorname: string,
  rolleName: string,
  koPersNr?: string
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, organisationName);
  const rolleId: string = await getRolleId(page, rolleName);
  const userInfo: UserInfo = await createPerson(page, organisationId, rolleId, familienname, vorname, koPersNr);
  return userInfo;
}

export async function createRolleAndPersonWithUserContext(
  page: Page,
  organisationName: string,
  rollenArt: string,
  familienname: string,
  vorname: string,
  idSPs: string[],
  rolleName: string,
  koPersNr?: string,
  klasseId?: string,
  merkmaleName?: string[]
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, organisationName);
  const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName, merkmaleName);

  await addSPToRolle(page, rolleId, idSPs);
  const userInfo: UserInfo = await createPerson(
    page,
    organisationId,
    rolleId,
    familienname,
    vorname,
    koPersNr,
    klasseId,
    merkmaleName
  );
  return userInfo;
}

export async function addSecondOrganisationToPerson(
  page: Page,
  personId: string,
  organisationId1: string,
  organisationId2: string,
  rolleId: string
): Promise<void> {
  const response: APIResponse = await page.request.put(FRONTEND_URL + 'api/personenkontext-workflow/' + personId, {
    data: {
      lastModified: '2034-09-11T08:28:36.590Z',
      count: 1,
      personenkontexte: [
        {
          personId: personId,
          organisationId: organisationId1,
          rolleId: rolleId,
        },
        {
          personId: personId,
          organisationId: organisationId2,
          rolleId: rolleId,
        },
      ],
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);
}

export async function deletePerson(page: Page, personId: string): Promise<void> {
  const response: APIResponse = await page.request.delete(FRONTEND_URL + `api/personen/${personId}`, {
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(204);
}

export async function getPersonId(page: Page, searchString: string): Promise<string> {
  const response: APIResponse = await page.request.get(
    FRONTEND_URL + `api/personen-frontend?suchFilter=${searchString}`,
    {
      failOnStatusCode: false,
      maxRetries: 3,
    }
  );
  expect(response.status()).toBe(200);
  const json: PersonenFrontendResponse = await response.json();
  return json.items[0].person.id;
}

export async function createTeacherAndLogin(page: Page): Promise<UserInfo> {
  const header: HeaderPage = new HeaderPage(page);
  const login: LoginPage = new LoginPage(page);
  const userInfo: UserInfo = await createRolleAndPersonWithUserContext(
    page,
    testschuleName,
    typeLehrer,
    await generateNachname(),
    await generateVorname(),
    [await getServiceProviderId(page, email), await getServiceProviderId(page, kalender), await getServiceProviderId(page, adressbuch)],
    await generateRolleName(),
    await generateKopersNr()
  );

  await header.logout({ logoutViaStartPage: true });
  await header.buttonLogin.click();
  await login.login(userInfo.username, userInfo.password);
  await login.updatePW();
  await expect(header.iconMyProfil).toBeVisible();
  await expect(header.iconLogout).toBeVisible();
  return userInfo;
}

/**
 * Sets the UEM-Password for a person in LDAP.
 * @param page
 * @param personId
 */
export async function setUEMPassword(page: Page, personId: string): Promise<string> {
    const response: APIResponse = await page.request.patch(FRONTEND_URL + `api/personen/${personId}/uem-password`, {failOnStatusCode: false, maxRetries: 3});
    expect(response.status()).toBe(202);
    return await response.text();
}

export async function setTimeLimitPersonenkontext(
  page: Page,
  personId: string,
  organisationId: string,
  rolleId: string,
  timeLimit: string
): Promise<void> {
  const response: APIResponse = await page.request.put(FRONTEND_URL + 'api/personenkontext-workflow/' + personId, {
    data: {
      lastModified: '2034-09-11T08:28:36.590Z',
      count: 1,
      personenkontexte: [
        {
          befristung: timeLimit,
          personId: personId,
          organisationId: organisationId,
          rolleId: rolleId,
        },
      ],
    },
    failOnStatusCode: false,
    maxRetries: 3,
  });
  expect(response.status()).toBe(200);
}