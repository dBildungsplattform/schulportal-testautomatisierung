import { systemrechtLabel } from "../../base/berechtigungen";
import { rollenMerkmalLabel } from "../../base/merkmale";
import { testschuleName } from "../../base/organisation";
import { rollenArtLabel } from "../../base/rollentypen";
import { adressbuch, anleitungen, email, helpdeskKontaktieren, itslearning, kalender, opSH, psychosozialesBeratungsangebot, schoolSH, schulportaladmin, schulrechtAZ, webUntis } from "../../base/sp";
import { generateRolleName } from "../../base/utils/generateTestdata";
import { RolleCreationParams } from "../../pages/admin/rollen/RolleCreationView.neu.page";

export const rolleCreationParams: RolleCreationParams[] = [
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: rollenArtLabel.LEHR,
    merkmale: [rollenMerkmalLabel.BEFRISTUNG_PFLICHT, rollenMerkmalLabel.KOPERS_PFLICHT],
    systemrechte: [],
    serviceProviders: [
      email,
      itslearning,
      kalender,
      adressbuch,
      opSH,
      schoolSH,
      webUntis,
      anleitungen,
      helpdeskKontaktieren,
      psychosozialesBeratungsangebot,
      schulrechtAZ,
    ],
  },
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: rollenArtLabel.LERN,
    merkmale: [],
    systemrechte: [],
    serviceProviders: [itslearning, webUntis],
  },
  {
    name: generateRolleName(),
    administrationsebene: testschuleName,
    rollenart: rollenArtLabel.LEIT,
    merkmale: [],
    systemrechte: [
      systemrechtLabel.LANDESBEDIENSTETE_SUCHEN_UND_HINZUFUEGEN,
      systemrechtLabel.KLASSEN_VERWALTEN,
      systemrechtLabel.EINGESCHRAENKT_NEUE_BENUTZER_ERSTELLEN,
      systemrechtLabel.PERSONEN_VERWALTEN,
    ],
    serviceProviders: [schulportaladmin],
  },
];