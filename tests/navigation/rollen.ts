export const ROLLEN_CASES: {
    name: string;
    permissions: string[];
}[] = [
  {
    name: 'Alle Systemrechte',
    permissions: [
      'PERSONEN_VERWALTEN',
      'PERSONEN_ANLEGEN',
      'IMPORT_DURCHFUEHREN',
      'KLASSEN_VERWALTEN',
      'ROLLEN_VERWALTEN',
      'SCHULEN_VERWALTEN',
      'LANDESBEDIENSTETE_SUCHEN_UND_HINZUFUEGEN',
    ],
  },
  {
    name: 'PERSON_VERWALTEN',
    permissions: ['PERSONEN_VERWALTEN'],
  },
  {
    name: 'PERSONEN_VERWALTEN + KLASSEN_VERWALTEN',
    permissions: ['PERSONEN_VERWALTEN', 'KLASSEN_VERWALTEN'],
  },
];
