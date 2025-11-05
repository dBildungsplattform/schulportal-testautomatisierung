import { RollenSystemRecht } from './api/generated/models/RollenSystemRecht';

export const rollenVerwalten: RollenSystemRecht = 'ROLLEN_VERWALTEN';
export const personenSofortLoeschen: RollenSystemRecht = 'PERSONEN_SOFORT_LOESCHEN';
export const personenVerwalten: RollenSystemRecht = 'PERSONEN_VERWALTEN';
export const schulenVerwalten: RollenSystemRecht = 'SCHULEN_VERWALTEN';
export const klassenVerwalten: RollenSystemRecht = 'KLASSEN_VERWALTEN';
export const schultraegerVerwalten: RollenSystemRecht = 'SCHULTRAEGER_VERWALTEN';
export const personenAnlegen: RollenSystemRecht = 'PERSONEN_ANLEGEN';

export const systemrechtLabel: Record<RollenSystemRecht, string> = {
  IMPORT_DURCHFUEHREN: 'Darf Import durchführen',
  ROLLEN_VERWALTEN: 'Darf Rollen verwalten',
  PERSONEN_SOFORT_LOESCHEN: 'Darf Benutzer sofort löschen',
  PERSONEN_VERWALTEN: 'Darf Benutzer verwalten',
  SCHULEN_VERWALTEN: 'Darf Schulen verwalten',
  KLASSEN_VERWALTEN: 'Darf Klassen verwalten',
  SCHULTRAEGER_VERWALTEN: 'Darf Schulträger verwalten',
  PERSON_SYNCHRONISIEREN: 'Darf Benutzer synchronisieren',
  PERSONEN_ANLEGEN: 'Darf Benutzer anlegen',
  BULK_VERWALTEN: 'Darf Mehrfachbearbeitung ausführen',
  SCHULPORTAL_VERWALTEN: 'Darf Portal verwalten',
  HINWEISE_BEARBEITEN: 'Darf Hinweise bearbeiten',
  LANDESBEDIENSTETE_SUCHEN_UND_HINZUFUEGEN: 'Darf Landesbedienstete suchen und hinzufügen',
  EINGESCHRAENKT_NEUE_BENUTZER_ERSTELLEN: 'Darf eingeschränkt neue Benutzer erstellen',
  //   "ROLLEN_ERWEITERN": "Darf Rollen schulspezifisch erweitern",
  //   "ANGEBOTE_VERWALTEN": "Darf Angebote verwalten"
  CRON_DURCHFUEHREN: '', // no label in UI
  PERSONEN_LESEN: '', // no label in UI
};
