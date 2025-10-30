import { Page, expect } from '@playwright/test';
import { FRONTEND_URL } from './baseApi';
import { generateCurrentDate, generateKopersNr, generateNachname, generateRolleName } from '../utils/generateTestdata';
import { generateVorname } from '../utils/generateTestdata';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { befristungPflicht } from '../merkmale';
import { getOrganisationId } from './organisationApi';
import { addServiceProvidersToRolle, createRolle, getRolleId } from './rolleApi';
import { HeaderPage } from '../../pages/components/Header.page';
import { LoginPage } from '../../pages/LoginView.page';
import { testschuleName } from '../organisation';
import { typeLehrer } from '../rollentypen';
import { getServiceProviderId } from './serviceProviderApi';
import { adressbuch, email, kalender } from '../sp';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
import { DbiamPersonenkontextWorkflowControllerCommitRequest, DbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRequest, PersonenkontextApi } from './generated/apis/PersonenkontextApi';
import { ApiResponse, Configuration } from './generated/runtime';
import { DbiamCreatePersonWithPersonenkontexteBodyParams, DBiamPersonResponse, DbiamUpdatePersonenkontexteBodyParams, LockUserBodyParams, PersonenkontexteUpdateResponse, PersonFrontendControllerFindPersons200Response, PersonLockResponse, RollenArt, RollenMerkmal } from './generated/models';
import { PersonControllerDeletePersonByIdRequest, PersonControllerLockPersonRequest, PersonControllerResetUEMPasswordByPersonIdRequest, PersonenApi } from './generated/apis/PersonenApi';
import { PersonenFrontendApi, PersonFrontendControllerFindPersonsRequest } from './generated/apis/PersonenFrontendApi';

export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
  vorname: string;
  familienname: string;
  kopersnummer: string;
  email: string;
}

export function constructPersonenkontextApi(page: Page): PersonenkontextApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenkontextApi(config);
}

export function constructPersonenApi(page: Page): PersonenApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenApi(config);
}

export function constructPersonenFrontendApi(page: Page): PersonenFrontendApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenFrontendApi(config);
}

export async function freshLoginPage(page: Page): Promise<LoginViewPage> {
  return (await FromAnywhere(page).start()).navigateToLogin();
}

function normalizeString(value: string): string {
  return value.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

function generateEmailFromName(vorname: string, familienname: string): string {
  return `${normalizeString(vorname)}.${normalizeString(familienname)}@schule-sh.de`;
}

export async function createPerson(
  page: Page,
  organisationId: string,
  rolleId: string,
  familienname?: string,
  vorname?: string,
  koPersNr?: string,
  klasseId?: string,
  merkmalNames?: Set<RollenMerkmal>
): Promise<UserInfo> {
  try {
    const createPersonBodyParams: DbiamCreatePersonWithPersonenkontexteBodyParams = {
      familienname: familienname || await generateNachname(),
      vorname: vorname || await generateVorname(),
      createPersonenkontexte: [
        {
          organisationId: organisationId,
          rolleId: rolleId,
        },
      ],
    }

    if (klasseId) {
      createPersonBodyParams.createPersonenkontexte.push({
        organisationId: klasseId,
        rolleId: rolleId,
      });
    }

    if (koPersNr) {
      createPersonBodyParams.personalnummer = koPersNr;
    }

    if (merkmalNames) {
      for (const merkmal of merkmalNames) {
        if (merkmal == befristungPflicht) {
          createPersonBodyParams.befristung = generateCurrentDate({ days: 0, months: 6 });
        }
      }
    }

    const requestParameters: DbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRequest = {
      dbiamCreatePersonWithPersonenkontexteBodyParams: createPersonBodyParams
    };

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<DBiamPersonResponse> = await personenkontextApi.dbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRaw(requestParameters);
    await expect(response.raw.status).toBe(201);

    const createdPerson: DBiamPersonResponse = await response.value();

    return {
      username: createdPerson.person.username,
      password: createdPerson.person.startpasswort,
      rolleId: rolleId,
      organisationId: organisationId,
      personId: createdPerson.person.id,
      vorname: createdPerson.person.name.vorname,
      familienname: createdPerson.person.name.familienname,
      kopersnummer: koPersNr,
      email: generateEmailFromName(createdPerson.person.name.vorname, createdPerson.person.name.familienname),
    };
  } catch (error) {
    console.error('[ERROR] createPerson failed:', error);
    throw error;
  }
}

export async function createPersonWithPersonenkontext(
  page: Page,
  organisationName: string,
  rolleName: string,
  vorname?: string,
  familienname?: string,
  koPersNr?: string
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, organisationName);
  const rolleId: string = await getRolleId(page, rolleName);
  const userInfo: UserInfo = await createPerson(page, organisationId, rolleId, familienname, vorname, koPersNr);
  return userInfo;
}

export async function createRolleAndPersonWithPersonenkontext(
  page: Page,
  organisationName: string,
  rollenArt: RollenArt,
  familienname: string,
  vorname: string,
  idSPs: string[],
  rolleName: string,
  koPersNr?: string,
  klasseId?: string,
  merkmaleName?: Set<RollenMerkmal>
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, organisationName);
  const rolleId: string = await createRolle(page, rollenArt, organisationId, rolleName, merkmaleName);

  await addServiceProvidersToRolle(page, rolleId, idSPs);
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

export async function removeAllPersonenkontexte(
  page: Page,
  personId: string
): Promise<void> {
  try {
    const dbiamUpdatePersonenkontexteBodyParams: DbiamUpdatePersonenkontexteBodyParams = {
      lastModified: new Date(),
      count: 1,
      /* an empty array clears all personenkontexte */
      personenkontexte: [],
    };

    const requestParameters: DbiamPersonenkontextWorkflowControllerCommitRequest = {
      personId,
      dbiamUpdatePersonenkontexteBodyParams,
    };

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<PersonenkontexteUpdateResponse> = await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    await expect(response.raw.status).toBe(200);
  } catch (error) {
    console.error('[ERROR] removeAllPersonenkontexte failed:', error);
    throw error;
  }
}

export async function lockPerson(page: Page, personId: string, organisationId: string): Promise<void> {
  try {
    const lockUserBodyParams: LockUserBodyParams = {
      lock: true,
      lockedBy: organisationId,
      lockedUntil: generateCurrentDate({ days: 30, months: 0 }),
    };

    const requestParameters: PersonControllerLockPersonRequest = {
      personId: personId,
      lockUserBodyParams,
    };

    const personenApi: PersonenApi = constructPersonenApi(page);
    const response: ApiResponse<PersonLockResponse> = await personenApi.personControllerLockPersonRaw(requestParameters);
    await expect(response.raw.status).toBe(202);

    const lockMessage: PersonLockResponse = await response.value();
    expect(lockMessage.message).toBe('User has been successfully locked.');
  } catch (error) {
    console.error('[ERROR] lockPerson failed:', error);
    throw error;
  }
}

export async function addSecondOrganisationToPerson(
  page: Page,
  personId: string,
  organisationId1: string,
  organisationId2: string,
  rolleId: string
): Promise<void> {
  try {
    const dbiamUpdatePersonenkontexteBodyParams: DbiamUpdatePersonenkontexteBodyParams = {
      lastModified: generateCurrentDate({ days: 0, months: 0 }),
      count: 1,
      personenkontexte: [
        {
          personId,
          organisationId: organisationId1,
          rolleId,
        },
        {
          personId,
          organisationId: organisationId2,
          rolleId,
        },
      ],
    };

    const requestParameters: DbiamPersonenkontextWorkflowControllerCommitRequest = {
      personId: personId,
      dbiamUpdatePersonenkontexteBodyParams,
    };

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<PersonenkontexteUpdateResponse> = await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    await expect(response.raw.status).toBe(200);

    const updatedPersonenkontexte: PersonenkontexteUpdateResponse = await response.value();
    expect(updatedPersonenkontexte.dBiamPersonenkontextResponses.length).toBe(2);
  } catch (error) {
    console.error('[ERROR] addSecondOrganisationToPerson failed:', error);
    throw error;
  }
}

export async function deletePerson(page: Page, personId: string): Promise<void> {
  try {
    const requestParameters: PersonControllerDeletePersonByIdRequest = {
      personId,
    }

    const personenApi: PersonenApi = constructPersonenApi(page);
    const response: ApiResponse<void> = await personenApi.personControllerDeletePersonByIdRaw(requestParameters);
    await expect(response.raw.status).toBe(204);
  } catch (error) {
    console.error('[ERROR] deletePerson failed:', error);
    throw error;
  }
}

export async function getPersonId(page: Page, searchString: string): Promise<string> {
  try {
    const requestParameters: PersonFrontendControllerFindPersonsRequest = {
      suchFilter: searchString,
      limit: 1,
    }

    const personenFrontendApi: PersonenFrontendApi = constructPersonenFrontendApi(page);
    const response: ApiResponse<PersonFrontendControllerFindPersons200Response> = await personenFrontendApi.personFrontendControllerFindPersonsRaw(requestParameters)
    await expect(response.raw.status).toBe(200);

    const fetchedPersonen: PersonFrontendControllerFindPersons200Response = await response.value();
    return fetchedPersonen.items[0].person.id;

  } catch (error) {
    console.error('[ERROR] getPersonId failed:', error);
    throw error;
  }
}

export async function createTeacherAndLogin(page: Page): Promise<UserInfo> {
  const header: HeaderPage = new HeaderPage(page);
  const login: LoginPage = new LoginPage(page);
  const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
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
  try {
    const requestParameters: PersonControllerResetUEMPasswordByPersonIdRequest = {
      personId,
    };

    const personenApi: PersonenApi = constructPersonenApi(page);
    const response: ApiResponse<string> = await personenApi.personControllerResetUEMPasswordByPersonIdRaw(requestParameters);
    await expect(response.raw.status).toBe(202);

    const newPassword: string = await response.value();
    return newPassword;
  } catch (error) {
    console.error('[ERROR] setUEMPassword failed:', error);
    throw error;
  }
}

export async function setTimeLimitPersonenkontext(
  page: Page,
  personId: string,
  organisationId: string,
  rolleId: string,
  timeLimit: Date
): Promise<void> {
  try {
    const dbiamUpdatePersonenkontexteBodyParams: DbiamUpdatePersonenkontexteBodyParams = {
      lastModified: generateCurrentDate({ days: 0, months: 0 }),
      count: 1,
      personenkontexte: [
        {
          befristung: timeLimit,
          personId: personId,
          organisationId: organisationId,
          rolleId: rolleId,
        },
      ],
    }

    const requestParameters: DbiamPersonenkontextWorkflowControllerCommitRequest = {
      personId,
      dbiamUpdatePersonenkontexteBodyParams,
    }

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<PersonenkontexteUpdateResponse> = await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    await expect(response.raw.status).toBe(200);

    const updatedPersonenkontexte: PersonenkontexteUpdateResponse = await response.value();
    await expect(updatedPersonenkontexte.dBiamPersonenkontextResponses.length).toBe(1);
  } catch (error) {
    console.error('[ERROR] setTimeLimitPersonenkontext failed:', error);
    throw error;
  }
}