import { Page } from '@playwright/test';
import { createKlasse, getKlasseId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { typeSchueler } from '../../base/rollentypen';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { itslearning } from '../../base/sp';
import { generateKlassenname, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { SchuleCreationParams } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';

// Konstanten für Testdaten-Generierung
const KLASSEN_ANZAHL_SCHULE_1: number = 26;
const KLASSEN_ANZAHL_SCHULE_2: number = 2;
const SCHUELER_ANZAHL_SCHULE_1: number = 3;
const SCHUELER_ANZAHL_SCHULE_2: number = 2;

export interface PersonenMehrfachbearbeitungTestData {
  klassenNamenSchule1: string[];
  klassenNamenSchule2?: string[];
  schuelerSchule1: UserInfo[];
  schuelerSchule2?: UserInfo[]
}

interface Klassen {
  id: string;
  klassenCount: number;
}

interface Schueler {
  schuleName: string;
  klassenName: string;
  count: number;
}

export async function createTestDataForSchuelerVersetzen(
  page: Page,
  schule1Params: SchuleCreationParams,
  schuleId: string,
  schule2Params?: SchuleCreationParams,
  schuleId2?: string
): Promise<PersonenMehrfachbearbeitungTestData> {
  const hasMultipleSchulen: boolean = schule2Params !== undefined && schuleId2 !== undefined;

  const klassenNamenSchule1: string[] = await createKlassenForSchule(page, { id: schuleId, klassenCount: KLASSEN_ANZAHL_SCHULE_1 });
  const klassenNamenSchule2: string[] | undefined = hasMultipleSchulen
    ? await createKlassenForSchule(page, { id: schuleId2, klassenCount: KLASSEN_ANZAHL_SCHULE_2 })
    : undefined;

  const schuelerSchule1: UserInfo[] = await createSchuelerForSchule(
    page,
    {
      schuleName: schule1Params.name,
      klassenName: klassenNamenSchule1[0],
      count: SCHUELER_ANZAHL_SCHULE_1
    }
  );

  const schuelerSchule2: UserInfo[] | undefined = hasMultipleSchulen && schule2Params && klassenNamenSchule2
    ? await createSchuelerForSchule(
        page,
        {
          schuleName: schule2Params.name,
          klassenName: klassenNamenSchule2[0],
          count: SCHUELER_ANZAHL_SCHULE_2
        }
      )
    : undefined;

  return {
    klassenNamenSchule1,
    klassenNamenSchule2,
    schuelerSchule1,
    schuelerSchule2
  };
}

/**
 * Erstellt Klassen für eine Schule
 */
async function createKlassenForSchule(page: Page, klasse: Klassen): Promise<string[]> {
  return Promise.all(
    Array.from({ length: klasse.klassenCount }, async () => {
      const klassenname: string = generateKlassenname();
      await createKlasse(page, klasse.id, klassenname);
      return klassenname;
    })
  );
}

/**
 * Erstellt Schüler für eine Schule und ordnet sie einer Klasse zu
 */
async function createSchuelerForSchule(
  page: Page,
  schueler: Schueler
): Promise<UserInfo[]> {
  return Promise.all(
    Array.from({ length: schueler.count }, async () => {
      const klasseId: string = await getKlasseId(page, schueler.klassenName);
      const serviceProviderId: string = await getServiceProviderId(page, itslearning);

      return createRolleAndPersonWithPersonenkontext(
        page,
        schueler.schuleName,
        typeSchueler,
        generateNachname(),
        generateVorname(),
        [serviceProviderId],
        generateRolleName(),
        undefined,
        klasseId
      );
    })
  );
}

// Platz für weitere Testdaten-Funktionen für Mehrfachbearbeitungen

