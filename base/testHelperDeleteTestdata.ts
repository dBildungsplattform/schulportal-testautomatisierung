import { deleteRolle, getRolleId} from "./api/testHelperRolle.page";
import { deletePersonen, getPersonId } from "./api/testHelperPerson.page";
import { getKlasseId, deleteKlasse } from "./api/testHelperOrganisation.page";


export async function deletePersonById(personId, page){  // personId ist ein array mit allen zu löschenden Benutzern
    for (const item in personId){
        await deletePersonen(page, personId[item]);
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

  export async function deletePersonByUsername(username, page){  // username ist ein array mit allen zu löschenden Benutzern
    for (const item in username){
      const personId = await getPersonId(page, username[item]);
      await deletePersonen(page, personId);
    }
  }

  export async function deleteClassByName(className, page){  // className ist ein array mit allen zu löschenden Klassen
    for (const item in className){
      const classId = await getKlasseId(page, className[item]);
      await deleteKlasse(page, classId);
    }
  }