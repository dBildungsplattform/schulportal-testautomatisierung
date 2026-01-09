/**
 * Defines different roles with corresponding system rights (permissions)
 * for testing purposes.
 *
 * Each role specifies:
 * - `name`: Human-readable role description.
 * - `permissions`: Array of system rights assigned to that role.
 *
 * These roles are used in tests to check:
 * - Visibility of menu items based on system rights.
 * - Navigation functionality for different permission sets.
 */
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
