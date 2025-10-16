import { Page, expect, APIResponse } from '@playwright/test';
import { befristungPflicht } from '../merkmale';
import { generateCurrentDate, generateVorname, generateNachname } from '../utils/generateTestdata';
import { FRONTEND_URL } from './baseApi';
import FromAnywhere from '../../pages/FromAnywhere.neu';
import { LoginViewPage } from '../../pages/LoginView.neu.page';

export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
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
  person: {
    id: string,
    username: string,
    mandant: string,
    name: {
      familienname: string,
      vorname: string
    },
    revision: string,
    startpasswort: string,
    lastModified: string
  },
  dBiamPersonenkontextResponses: [
    {
      personId: string,
      organisationId: string,
      rolleId: string
    }
  ]
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
    username: json.person.username,
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