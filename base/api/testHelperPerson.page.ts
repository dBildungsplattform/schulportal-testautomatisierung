import { Page, expect, APIResponse } from '@playwright/test';
import { getOrganisationId } from './testHelperOrganisation.page';
import { createRolle } from './rolleApi'
import { addSPToRolle, getRolleId } from './testHelperRolle.page';
import { getSPId } from './testHelperServiceprovider.page';
import { UserInfo } from './testHelper.page';
import { HeaderPage } from '../../pages/components/Header.page';
import { LoginPage } from '../../pages/LoginView.page';
import { createPerson } from './personApi';
import {
  generateNachname,
  generateVorname,
  generateKopersNr,
  generateRolleName,
} from '../utils/generateTestdata';
import { testschuleName } from '../organisation';
import { email, kalender, adressbuch } from '../sp';
import { typeLehrer } from '../rollentypen';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';

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
    familienname,
    vorname,
    organisationId,
    rolleId,
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
  const json = await response.json();
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
    [await getSPId(page, email), await getSPId(page, kalender), await getSPId(page, adressbuch)],
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
