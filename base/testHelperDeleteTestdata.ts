import { deleteRolle, getRolleId } from './api/testHelperRolle.page';
import { deletePerson, getPersonId } from './api/testHelperPerson.page';
import { getKlasseId, deleteKlasse } from './api/testHelperOrganisation.page';
import { type Page } from '@playwright/test';

export async function deletePersonById(personId: string[], page: Page): Promise<void> {
  // personId ist ein array mit allen zu löschenden Benutzern
  for (const item in personId) {
    await deletePerson(page, personId[item]);
  }
}

export async function deleteRolleById(roleId: string[], page: Page): Promise<void> {
  // roleId ist ein array mit allen zu löschenden Rollen
  for (const item in roleId) {
    await deleteRolle(page, roleId[item]);
  }
}

export async function deleteRolleByName(roleName: string[], page: Page): Promise<void> {
  // roleName ist ein array mit allen zu löschenden Rollen
  for (const item in roleName) {
    const roleId: string = await getRolleId(page, roleName[item]);
    await deleteRolle(page, roleId);
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
    const klassenId: string = await getKlasseId(page, klassenName[item]);
    await deleteKlasse(page, klassenId);
  }
}
