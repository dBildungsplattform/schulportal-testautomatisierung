import { RollenSystemRecht } from "../../base/api/generated/models/RollenSystemRecht";
import { MenuBarPage } from "../../pages/components/MenuBar.neu.page";

export interface MenuTestCase {
  name: string;
  testId: string;
  navigate: (menu: MenuBarPage) => Promise<unknown>;
  route: string;
  requiredPermissions: RollenSystemRecht[];
}

export const MENU_TEST_CASES: MenuTestCase[] = [
  {
    name: 'Person management',
    testId: 'person-management-menu-item',
    route: '/admin/personen',
    requiredPermissions: [RollenSystemRecht.PersonenVerwalten],
    navigate: (menu: MenuBarPage) => menu.navigateToPersonManagement(),
  },
  {
    name: 'Person creation',
    testId: 'person-creation-menu-item',
    route: '/admin/personen/new',
    requiredPermissions: [RollenSystemRecht.PersonenAnlegen],
    navigate: (menu: MenuBarPage) => menu.navigateToPersonCreation(),
  },
  {
    name: 'Person import',
    testId: 'person-import-menu-item',
    route: '/admin/personen/import',
    requiredPermissions: [RollenSystemRecht.ImportDurchfuehren],
    navigate: (menu: MenuBarPage) => menu.navigateToPersonImport(),
  },
  {
    name: 'Landesbedienstete search',
    testId: 'person-search-menu-item',
    route: '/admin/limited/personen/search',
    requiredPermissions: [RollenSystemRecht.LandesbediensteteSuchenUndHinzufuegen],
    navigate: (menu: MenuBarPage) => menu.navigateToLandesbedienstetenSuchenUndHinzufuegen(),
  },
  {
    name: 'Klasse management',
    testId: 'klasse-management-menu-item',
    route: '/admin/klassen',
    requiredPermissions: [RollenSystemRecht.KlassenVerwalten],
    navigate: (menu: MenuBarPage) => menu.navigateToKlasseManagement(),
  },
  {
    name: 'Rolle management',
    testId: 'rolle-management-menu-item',
    route: '/admin/rollen',
    requiredPermissions: [RollenSystemRecht.RollenVerwalten],
    navigate: (menu: MenuBarPage) => menu.navigateToRolleManagement(),
  },
  {
    name: 'Schule management',
    testId: 'schule-management-menu-item',
    route: '/admin/schulen',
    requiredPermissions: [RollenSystemRecht.SchulenVerwalten],
    navigate: (menu: MenuBarPage) => menu.navigateToSchuleManagement(),
  },
];
