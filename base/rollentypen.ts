import {RollenArt} from './api/generated/models/RollenArt';

export const typeLandesadmin: RollenArt = 'SYSADMIN';
export const typeLehrer: RollenArt = 'LEHR';
export const typeSchueler: RollenArt = 'LERN';
export const typeSchuladmin: RollenArt = 'LEIT';

export {RollenArt} from './api/generated/models/RollenArt';
export const rollenArtLabel: Record<RollenArt, string> = {
    SYSADMIN: 'Sysadmin',
    LEHR: 'Lehr',
    LERN: 'Lern',
    LEIT: 'Leit',
    EXTERN: 'Extern',
    ORGADMIN: 'Orgadmin',
};