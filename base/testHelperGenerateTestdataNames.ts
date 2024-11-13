import { faker } from "@faker-js/faker/locale/de";

export async function generateLehrerVorname(){  
  return "TAuto-PW-V-" + faker.person.firstName();
}