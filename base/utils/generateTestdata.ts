import { faker } from '@faker-js/faker/locale/de';
import { generateRandomString, CharacterSetType } from 'ts-randomstring/lib/index.js';
import { format, addDays, addMonths } from 'date-fns';

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

export async function generateCurrentDate({
  days,
  months,
  formatDMY,
}: {
  days: number;
  months: number;
  formatDMY: boolean;
}): Promise<string> {
  // creates current date and adds days + month to the current date
  // returned format is DD.MM.YYYY or YYYY.MM.DD
  const newDate: Date = addDays(addMonths(new Date(), months), days);

  if (formatDMY) {
    return format(newDate, 'dd.MM.yyyy');
  } else {
    return format(newDate, 'yyyy.MM.dd');
  }
}