import { faker } from "@faker-js/faker/locale/de";

export async function generateLehrerVorname(){  
  return "TAuto-PW-V-" + faker.person.firstName();
}

export async function generateLehrerNachname(){  
  return "TAuto-PW-N-" + faker.person.lastName();
}

export async function generateRolleName(){  
  return "TAuto-PW-R-" + faker.lorem.word({ length: { min: 8, max: 12 }});
}