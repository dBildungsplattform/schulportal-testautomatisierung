import { faker } from '@faker-js/faker/locale/de';
import { generateRandomString, CharacterSetType } from 'ts-randomstring/lib/index.js';
import { format, addDays, addMonths } from 'date-fns';

export function generateVorname(): string {
  return (
    'TAuto-PW-V-' +
    faker.person.firstName() +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export function generateNachname(): string {
  return (
    'TAuto-PW-N-' +
    faker.person.lastName() +
    generateRandomString({ length: 3, charSetType: CharacterSetType.Alphabetic })
  );
}

export function generateRolleName(): string {
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

export function generateCurrentDate({
  days,
  months,
}: {
  days: number;
  months: number;
}): Date {
  // creates current date and adds days + month to the current date
  const newDate: Date = addDays(addMonths(new Date(), months), days);
  
  return newDate;
}

export function formatDateDMY(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}