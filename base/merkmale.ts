import { RollenMerkmal } from './api/rolleApi';

export const befristungPflicht: RollenMerkmal = 'BEFRISTUNG_PFLICHT';
export const kopersNrPflicht: RollenMerkmal = 'KOPERS_PFLICHT';

export const rollenMerkmalLabel: Record<RollenMerkmal, string> = {
  BEFRISTUNG_PFLICHT: 'Befristung ist Pflichtangabe',
  KOPERS_PFLICHT: 'KoPers.-Nr. ist Pflichtangabe',
  MPT_ROLLE: 'Ist MPT-Rolle',
  PILOT_1_ROLLE: 'Ist Pilot-1-Rolle',
  PILOT_2_ROLLE: 'Ist Pilot-2-Rolle',
  PILOT_3_ROLLE: 'Ist Pilot-3-Rolle',
  PILOT_4_ROLLE: 'Ist Pilot-4-Rolle',
  PILOT_5_ROLLE: 'Ist Pilot-5-Rolle',
};
