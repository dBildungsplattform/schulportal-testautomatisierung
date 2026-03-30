import { RollenArt } from '../../base/api/generated';
import {
  email,
  itslearning,
  kalender,
  adressbuch,
  schulportaladmin,
  opSH,
  schoolSH,
  webUntis,
  anleitungen,
  helpdeskKontaktieren,
  psychosozialesBeratungsangebot,
  schulrechtAZ,
} from '../../base/sp';

type TestFixture = {
  rollenArt: RollenArt;
  serviceProviderNames: Array<string>;
};

export const testFixtures: Array<TestFixture> = [
  {
    rollenArt: RollenArt.Lehr,
    serviceProviderNames: [
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
    rollenArt: RollenArt.Lern,
    serviceProviderNames: [itslearning, webUntis],
  },
  {
    rollenArt: RollenArt.Leit,
    serviceProviderNames: [
      schulportaladmin,
      anleitungen,
      helpdeskKontaktieren,
      psychosozialesBeratungsangebot,
      schulrechtAZ,
    ],
  },
  {
    rollenArt: RollenArt.Sysadmin,
    serviceProviderNames: [schulportaladmin],
  },
];
