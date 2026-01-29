import { Page } from '@playwright/test';
import { createKlasse, getKlasseId } from '../../base/api/organisationApi';
import { createRolleAndPersonWithPersonenkontext, UserInfo } from '../../base/api/personApi';
import { typeSchueler } from '../../base/rollentypen';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { itslearning } from '../../base/sp';
import { generateKlassenname, generateNachname, generateRolleName, generateVorname } from '../../base/utils/generateTestdata';
import { SchuleCreationParams } from '../../pages/admin/organisationen/schulen/SchuleCreationView.neu.page';

export interface KlassenAndSchuelerData {
  klassenNamenSchule: string[];
  schuelerSchule: UserInfo[];
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

interface Schule {
  params: SchuleCreationParams;
  schuleId: string;
  klassenCount: number;
  schuelerCount: number;
}

export async function createKlassenAndSchuelerForSchulen(
  page: Page,
  schulen: Schule[]
): Promise<KlassenAndSchuelerData[]> {
  return Promise.all(
    schulen.map(async (schule: Schule): Promise<KlassenAndSchuelerData> => {
      const klassenNamenSchule: string[] = await createKlassenForSchule(page, { id: schule.schuleId, klassenCount: schule.klassenCount });
      const schuelerSchule: UserInfo[] = await createSchuelerForSchule(
        page,
        {
          schuleName: schule.params.name,
          klassenName: klassenNamenSchule[0],
          count: schule.schuelerCount
        }
      );
      return { klassenNamenSchule, schuelerSchule };
    })
  );
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

