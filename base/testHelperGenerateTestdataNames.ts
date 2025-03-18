import { faker } from '@faker-js/faker/locale/de';
import { generateRandomString, CharacterSetType } from 'ts-randomstring/lib/index.js';

export async function generateVorname(): Promise<string> {
  return (
    'TAuto-PW-V-' +
    faker.person.firstName() +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export async function generateNachname(): Promise<string> {
  return (
    'TAuto-PW-N-' +
    faker.person.lastName() +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export async function generateRolleName(): Promise<string> {
  return (
    'TAuto-PW-R-' +
    faker.lorem.word({ length: { min: 7, max: 7 } }) +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export async function generateKopersNr(): Promise<string> {
  return '0815' + faker.string.numeric({ length: 8 });
}

export async function generateKlassenname(): Promise<string> {
  return (
    'TAuto-PW-K-12a ' +
    faker.lorem.word({ length: { min: 8, max: 8 } }) +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export async function generateSchulname(): Promise<string> {
  return (
    'TAuto-PW-S-' +
    faker.lorem.word({ length: { min: 8, max: 8 } }) +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export async function generateDienststellenNr(): Promise<string> {
  return '0' + faker.number.bigInt({ min: 10000000, max: 100000000 });
}
