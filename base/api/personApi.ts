import { Page, expect, APIResponse } from '@playwright/test';
import { befristungPflicht } from '../merkmale';
import { generateCurrentDate, generateVorname, generateNachname } from '../utils/generateTestdata';
import { FRONTEND_URL } from './baseApi';


export interface UserInfo {
  username: string;
  password: string;
  rolleId: string;
  organisationId: string;
  personId: string;
}

interface CreatedPersonResponse {
  person: {
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
  },
  dBiamPersonenkontextResponses: [
    {
      personId: string,
      organisationId: string,
      rolleId: string
    }
  ]
}

export async function createPerson(
  page: Page,
  organisationId: string,
  rolleId: string,
  familienname?: string,
  vorname?: string,
  koPersNr?: string,
  klasseId?: string,
  merkmaleName?: string[]
): Promise<UserInfo> {
  interface PersonRequestData {
    data: {
      familienname: string;
      vorname: string;
      createPersonenkontexte: {
        organisationId: string;
        rolleId: string;
      }[];
    };
    failOnStatusCode: boolean;
    maxRetries: number;
  }

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

  if (merkmaleName) {
    for (const index in merkmaleName) {
      if (merkmaleName[index] == befristungPflicht) {
        requestData.data['befristung'] = await generateCurrentDate({ days: 0, months: 6, formatDMY: false });
      }
    }
  }

  const response: APIResponse = await page.request.post(FRONTEND_URL + 'api/personenkontext-workflow/', requestData);
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