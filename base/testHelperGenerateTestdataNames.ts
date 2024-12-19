import { faker } from "@faker-js/faker/locale/de";
import { generateRandomString, CharacterSetType } from "ts-randomstring/lib/index.js"

export async function generateVorname(){  
  return "TAuto-PW-V-" + faker.person.firstName() + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic})
}

export async function generateNachname(){  
  return "TAuto-PW-N-" + faker.person.lastName() + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic})
}

export async function generateRolleName(){  
  return "TAuto-PW-R-" + faker.lorem.word({ length: { min: 7, max: 7 }}) + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic});
}

export async function generateKopersNr(){  
  return '0815' + faker.string.numeric({ length: 3 });
}

export async function generateKlassenname(){  
  return "TAuto-PW-K-12a " + faker.lorem.word({ length: { min: 8, max: 8 }}) + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic});
}

export async function generateSchulname(){  
  return "TAuto-PW-S-" + faker.lorem.word({ length: { min: 8, max: 8 }}) + generateRandomString({length: 3,charSetType: CharacterSetType.Alphabetic});
}

export async function generateDienststellenNr(){  
  return "0" + faker.number.bigInt({ min: 10000000, max: 100000000 });
}