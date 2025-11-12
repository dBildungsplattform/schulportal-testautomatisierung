import { RollenArt } from "../../base/api/generated";
import { klasse1Testschule } from "../../base/klassen";
import { landSH, testschuleName, testschuleDstNr } from "../../base/organisation";
import { typeLandesadmin, typeLehrer, typeSchuladmin } from "../../base/rollentypen";
import { schulportaladmin, email, itslearning } from "../../base/sp";
import { generateVorname, generateNachname, generateRolleName, generateKopersNr } from "../../base/utils/generateTestdata";
import { PersoenlicheDaten, Zuordnung } from "../../pages/ProfileView.neu.page";

interface TestData {
  actor: string;
  personalData: PersoenlicheDaten;
  zuordnungen: Zuordnung[];
  serviceProviders: string[];
}

export const testData: TestData[] = [
  {
    actor: 'Landesadmin',
    personalData: {
      vorname: generateVorname(),
      nachname: generateNachname(),
      username: '', // set in test
      rollenart: typeLandesadmin,
    },
    zuordnungen: [
      {
        organisationsname: landSH,
        rollenname: generateRolleName(),
        rollenart: typeLandesadmin,
      },
    ],
    serviceProviders: [schulportaladmin],
  },
  {
    actor: 'Lehrer mit einer Schulzuordnung',
    personalData: {
      vorname: generateVorname(),
      nachname: generateNachname(),
      kopersnummer: generateKopersNr(),
      username: '', // set in test
      rollenart: typeLehrer,
    },
    zuordnungen: [
      {
        organisationsname: testschuleName,
        dienststellennummer: testschuleDstNr,
        rollenname: generateRolleName(),
        rollenart: typeLehrer,
      },
    ],
    serviceProviders: [email],
  },
  {
    actor: 'Schuladmin mit einer Schulzuordnung',
    personalData: {
      vorname: generateVorname(),
      nachname: generateNachname(),
      username: '', // set in test
      rollenart: typeSchuladmin,
    },
    zuordnungen: [
      {
        organisationsname: testschuleName,
        dienststellennummer: testschuleDstNr,
        rollenname: generateRolleName(),
        rollenart: typeSchuladmin,
      },
    ],
    serviceProviders: [schulportaladmin],
  },
  {
    actor: 'Schüler mit einer Schulzuordnung',
    personalData: {
      vorname: generateVorname(),
      nachname: generateNachname(),
      username: '', // set in test
      rollenart: RollenArt.Lern,
    },
    zuordnungen: ((): Zuordnung[] => {
      const rollenname: string = generateRolleName();
      return [
        {
          organisationsname: testschuleName,
          dienststellennummer: testschuleDstNr,
          klassenName: klasse1Testschule,
          rollenname,
          rollenart: RollenArt.Lern,
        },
      ];
    })(),
    serviceProviders: [itslearning],
  },
];