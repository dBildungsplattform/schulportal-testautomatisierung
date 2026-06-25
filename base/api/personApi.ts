import { expect, Page } from '@playwright/test';
import { HeaderPage } from '../../pages/components/Header.page';
import FromAnywhere from '../../pages/FromAnywhere';
import { LoginViewPage } from '../../pages/LoginView.page';
import { befristungPflicht } from '../merkmale';
import { testschuleName } from '../organisation';
import { adressbuch, email, kalender } from '../sp';
import {
  generateCurrentDate,
  generateKopersNr,
  generateNachname,
  generateRolleName,
  generateVorname,
} from '../utils/generateTestdata';
import { FRONTEND_URL } from './baseApi';
import { Class2FAApi } from './generated';
import {
  PersonControllerDeletePersonByIdRequest,
  PersonControllerLockPersonRequest,
  PersonControllerResetUEMPasswordByPersonIdRequest,
  PersonenApi,
} from './generated/apis/PersonenApi';
import { PersonenFrontendApi, PersonFrontendControllerFindPersonsRequest } from './generated/apis/PersonenFrontendApi';
import {
  DbiamPersonenkontextWorkflowControllerCommitRequest,
  DbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRequest,
  PersonenkontextApi,
} from './generated/apis/PersonenkontextApi';
import {
  DbiamCreatePersonWithPersonenkontexteBodyParams,
  DBiamPersonResponse,
  DbiamUpdatePersonenkontexteBodyParams,
  LockUserBodyParams,
  PersonendatensatzResponse,
  PersonenkontexteUpdateResponse,
  PersonFrontendControllerFindPersons200Response,
  PersonLockResponse,
  RollenArt,
  RollenMerkmal,
  RollenSystemRechtEnum,
} from './generated/models';
import { ApiResponse, Configuration } from './generated/runtime';
import { getOrganisationId } from './organisationApi';
import { makeFetchWithPlaywright } from './playwrightFetchAdapter';
import { createRolle, getRolleId } from './rolleApi';
import { getServiceProviderIdsMappedByName } from './serviceProviderApi';

export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
  vorname: string;
  nachname: string;
  kopersnummer: string;
}

export function constructPersonenkontextApi(page: Page): PersonenkontextApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL?.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenkontextApi(config);
}

export function constructPersonenApi(page: Page): PersonenApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL?.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenApi(config);
}

export function constructPersonenFrontendApi(page: Page): PersonenFrontendApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL?.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new PersonenFrontendApi(config);
}

export function construct2FAApi(page: Page): Class2FAApi {
  const config: Configuration = new Configuration({
    basePath: FRONTEND_URL?.replace(/\/$/, ''),
    fetchApi: makeFetchWithPlaywright(page),
  });
  return new Class2FAApi(config);
}

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
  merkmalNames?: Set<RollenMerkmal>,
): Promise<UserInfo> {
  try {
    const createPersonBodyParams: DbiamCreatePersonWithPersonenkontexteBodyParams = {
      familienname: familienname || generateNachname(),
      vorname: vorname || generateVorname(),
      createPersonenkontexte: [
        {
          organisationId: organisationId,
          rolleId: rolleId,
        },
      ],
    };

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
      dbiamCreatePersonWithPersonenkontexteBodyParams: createPersonBodyParams,
    };

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<DBiamPersonResponse> =
      await personenkontextApi.dbiamPersonenkontextWorkflowControllerCreatePersonWithPersonenkontexteRaw(
        requestParameters,
      );
    expect(response.raw.status).toBe(201);
    const createdPerson: DBiamPersonResponse = await response.value();

    return {
      username: createdPerson.person.username!,
      password: createdPerson.person.startpasswort,
      rolleId: rolleId,
      organisationId: organisationId,
      personId: createdPerson.person.id,
      vorname: createdPerson.person.name.vorname,
      nachname: createdPerson.person.name.familienname,
      kopersnummer: koPersNr ?? '',
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
  koPersNr?: string,
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, organisationName);
  const rolleId: string = await getRolleId(page, rolleName);
  const userInfo: UserInfo = await createPerson(page, organisationId, rolleId, familienname, vorname, koPersNr);
  return userInfo;
}

interface CreateRolleAndPersonWithPersonenkontextParams {
  organisationName: string;
  rollenArt: RollenArt;
  serviceProviderNames?: string[];
  rollenName?: string;
  familienname?: string;
  vorname?: string;
  klasseId?: string;
  koPersNr?: string;
  rollenMerkmalNamen?: Set<RollenMerkmal>;
  systemrechte?: Set<RollenSystemRechtEnum>;
}
export async function createRolleAndPersonWithPersonenkontext(
  page: Page,
  params: CreateRolleAndPersonWithPersonenkontextParams,
): Promise<UserInfo> {
  // Organisation wird nicht angelegt, da diese zur Zeit nicht gelöscht werden kann
  const organisationId: string = await getOrganisationId(page, params.organisationName);

  let serviceProviderIds = new Set<string>();
  if (params.serviceProviderNames && params.serviceProviderNames.length > 0) {
    const serviceProviderByNameMap: Map<string, string> = await getServiceProviderIdsMappedByName(
      page,
      params.serviceProviderNames,
      organisationId,
    );

    const missingServiceProviderNames: string[] = params.serviceProviderNames.filter(
      (name: string) => !serviceProviderByNameMap.has(name),
    );
    if (missingServiceProviderNames.length > 0) {
      throw new Error(
        `The following service providers were not found in the organization ${params.organisationName}: ${missingServiceProviderNames.join(
          ', ',
        )}`,
      );
    }

    serviceProviderIds = new Set(serviceProviderByNameMap.values());
  }

  const rolleId: string = await createRolle(
    page,
    params.rollenArt,
    organisationId,
    params.rollenName ?? generateRolleName(),
    params.rollenMerkmalNamen,
    params.systemrechte,
    serviceProviderIds,
  );

  const userInfo: UserInfo = await createPerson(
    page,
    organisationId,
    rolleId,
    params.familienname,
    params.vorname,
    params.koPersNr,
    params.klasseId,
    params.rollenMerkmalNamen,
  );
  return userInfo;
}

export async function removeAllPersonenkontexte(page: Page, personId: string): Promise<void> {
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
    const response: ApiResponse<PersonenkontexteUpdateResponse> =
      await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    expect(response.raw.status).toBe(200);
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
    const response: ApiResponse<PersonLockResponse> =
      await personenApi.personControllerLockPersonRaw(requestParameters);
    expect(response.raw.status).toBe(202);

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
  rolleId: string,
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
    const response: ApiResponse<PersonenkontexteUpdateResponse> =
      await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    expect(response.raw.status).toBe(200);

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
    };

    const personenApi: PersonenApi = constructPersonenApi(page);
    const response: ApiResponse<void> = await personenApi.personControllerDeletePersonByIdRaw(requestParameters);
    expect(response.raw.status).toBe(204);
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
    };

    const personenFrontendApi: PersonenFrontendApi = constructPersonenFrontendApi(page);
    const response: ApiResponse<PersonFrontendControllerFindPersons200Response> =
      await personenFrontendApi.personFrontendControllerFindPersonsRaw(requestParameters);
    expect(response.raw.status).toBe(200);

    const fetchedPersonen: PersonFrontendControllerFindPersons200Response = await response.value();
    return fetchedPersonen.items[0].person.id;
  } catch (error) {
    console.error('[ERROR] getPersonId failed:', error);
    throw error;
  }
}

export async function createTeacherAndLogin(page: Page): Promise<UserInfo> {
  const header: HeaderPage = new HeaderPage(page);
  const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(page, {
    organisationName: testschuleName,
    rollenArt: RollenArt.Lehr,
    serviceProviderNames: [email, kalender, adressbuch],
    koPersNr: generateKopersNr(),
  });

  await header.logout();
  const loginPage = await header.navigateToLogin();
  await loginPage.login(userInfo.username, userInfo.password);
  await loginPage.updatePassword();
  await header.checkIfIconsAreVisible();
  return userInfo;
}

/**
 * Sets the Inbetriebnahme-Passwort (device password) for a person in LDAP.
 * @param page
 * @param personId
 */
export async function setInbetriebnahmePasswort(page: Page, personId: string): Promise<string> {
  try {
    const requestParameters: PersonControllerResetUEMPasswordByPersonIdRequest = {
      personId,
    };

    const personenApi: PersonenApi = constructPersonenApi(page);
    const response: ApiResponse<string> =
      await personenApi.personControllerResetUEMPasswordByPersonIdRaw(requestParameters);
    expect(response.raw.status).toBe(202);

    const newPassword: string = await response.value();
    return newPassword;
  } catch (error) {
    console.error('[ERROR] setInbetriebnahmePasswort failed:', error);
    throw error;
  }
}

export async function setTimeLimitPersonenkontext(
  page: Page,
  personId: string,
  organisationId: string,
  rolleId: string,
  timeLimit: Date,
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
    };

    const requestParameters: DbiamPersonenkontextWorkflowControllerCommitRequest = {
      personId,
      dbiamUpdatePersonenkontexteBodyParams,
    };

    const personenkontextApi: PersonenkontextApi = constructPersonenkontextApi(page);
    const response: ApiResponse<PersonenkontexteUpdateResponse> =
      await personenkontextApi.dbiamPersonenkontextWorkflowControllerCommitRaw(requestParameters);
    expect(response.raw.status).toBe(200);

    const updatedPersonenkontexte: PersonenkontexteUpdateResponse = await response.value();
    expect(updatedPersonenkontexte.dBiamPersonenkontextResponses.length).toBe(1);
  } catch (error) {
    console.error('[ERROR] setTimeLimitPersonenkontext failed:', error);
    throw error;
  }
}

export async function getEmailByPersonId(page: Page, id: string): Promise<string | undefined> {
  const personenApi: PersonenApi = constructPersonenApi(page);
  const personendatensatzResponse: ApiResponse<PersonendatensatzResponse> =
    await personenApi.personControllerFindPersonByIdRaw({ personId: id });
  expect(personendatensatzResponse.raw.status).toBe(200);
  const personendatensatz: PersonendatensatzResponse = await personendatensatzResponse.value();
  return personendatensatz.person.email?.address;
}
