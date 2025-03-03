import { deleteRolle, getRolleId} from './api/testHelperRolle.page';
import { deletePerson, getPersonId } from './api/testHelperPerson.page';
import { getKlasseId, deleteKlasse } from './api/testHelperOrganisation.page';


export async function deletePersonById(personId, page){  // personId ist ein array mit allen zu löschenden Benutzern
  for (const item in personId){
    await deletePerson(page, personId[item]);
  }
}

export async function deleteRolleById(roleId, page){  // roleId ist ein array mit allen zu löschenden Rollen
  for (const item in roleId){
    await deleteRolle(page, roleId[item]);
  }
}

export async function deleteRolleByName(roleName, page){  // roleName ist ein array mit allen zu löschenden Rollen
  for (const item in roleName){
    const roleId = await getRolleId(page, roleName[item]);
    await deleteRolle(page, roleId);
  }
}

export async function deletePersonenBySearchStrings(page, searchStringArray){
  for (const item in searchStringArray){
    const personId = await getPersonId(page, searchStringArray[item]);
    await deletePerson(page, personId);
  }
}

export async function deletePersonBySearchString(page, searchString){
    const personId = await getPersonId(page, searchString);
    await deletePerson(page, personId);
}

export async function deleteKlasseByName(klassenName, page){  // klassenName ist ein array mit allen zu löschenden Klassen
  for (const item in klassenName){
    const klassenId = await getKlasseId(page, klassenName[item]);
    await deleteKlasse(page, klassenId);
  }
}