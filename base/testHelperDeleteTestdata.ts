import { deleteRolle, getRolleId } from './api/rolleApi';
import { deletePerson, getPersonId } from './api/personApi';
import { getKlasseId, deleteKlasse } from './api/organisationApi';
import { type Page } from '@playwright/test';

export async function deletePersonById(personId: string[], page: Page): Promise<void> {
  // personId ist ein array mit allen zu löschenden Benutzern
  for (const item in personId) {
    await deletePerson(page, personId[item]);
  }
}

export async function deleteRolleById(rolleId: string[], page: Page): Promise<void> {
  // rolleId ist ein array mit allen zu löschenden Rollen
  for (const item in rolleId) {
    await deleteRolle(page, rolleId[item]);
  }
}

export async function deleteRolleByName(rolleName: string[], page: Page): Promise<void> {
  // rolleName ist ein array mit allen zu löschenden Rollen
  for (const item in rolleName) {
    const rolleId: string = await getRolleId(page, rolleName[item]);
    await deleteRolle(page, rolleId);
  }
}

export async function deletePersonenBySearchStrings(page: Page, searchStringArray: string[]): Promise<void> {
  for (const item in searchStringArray) {
    const personId: string = await getPersonId(page, searchStringArray[item]);
    await deletePerson(page, personId);
  }
}

export async function deletePersonBySearchString(page: Page, searchString: string): Promise<void> {
  const personId: string = await getPersonId(page, searchString);
  await deletePerson(page, personId);
}

export async function deleteKlasseByName(klassenName: string[], page: Page): Promise<void> {
  // klassenName ist ein array mit allen zu löschenden Klassen
  for (const item in klassenName) {
    const klassenId: string | undefined = await getKlasseId(page, klassenName[item]);
    if (klassenId) await deleteKlasse(page, klassenId);
  }
}
