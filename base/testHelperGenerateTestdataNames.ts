import { faker } from "@faker-js/faker/locale/de";
import { generateRandomString, CharacterSetType } from "ts-randomstring/lib/index.js"

export async function generateLehrerVorname(){  
  return "TAuto-PW-V-" + faker.person.firstName() + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic})
}

export async function generateLehrerNachname(){  
  return "TAuto-PW-N-" + faker.person.lastName() + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic})
}

export async function generateRolleName(){  
  return "TAuto-PW-R-" + faker.lorem.word({ length: { min: 7, max: 7 }}) + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic})
}