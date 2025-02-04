import { Client, SearchResult } from 'ldapts';

declare type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

const encodeBase64 = (str: string): string => Buffer.from(str, 'binary').toString('base64');

export class TestHelperLdap {
  private static readonly BASE_DN: string = 'dc=schule-sh,dc=de';
  private static readonly BIND_DN: string = 'cn=admin,dc=schule-sh,dc=de';
  private static readonly OEFFENTLICHE_SCHULEN_OU: string = 'ou=oeffentlicheSchulen';
  private static readonly ERSATZ_SCHULEN_OU: string = 'ou=ersatzSchulen';

  private client: Client = new Client({
    url: `ldaps://localhost`,
    timeout: 3000,
  });

  public async bind(): Promise<void> {
    await this.client.bind(TestHelperLdap.BIND_DN, 'password');
  }

  public async validateUserExists(username: string): Promise<boolean> {
    const searchResultLehrer: SearchResult = await this.client.search(
      `${TestHelperLdap.OEFFENTLICHE_SCHULEN_OU},${TestHelperLdap.BASE_DN}`,
      {
        scope: 'sub',
        filter: `(uid=${username})`,
      },
    );

    if (searchResultLehrer.searchEntries.length !== 1) return false;

    return true;
  }

  public async validateUserAttributes(username: string, surname: string, givenName: string, userPassword): Promise<boolean> {
    const searchResultLehrer: SearchResult = await this.client.search(
      `${TestHelperLdap.OEFFENTLICHE_SCHULEN_OU},${TestHelperLdap.BASE_DN}`,
      {
        scope: 'sub',
        filter: `(uid=${username})`,
        attributes: ['givenName', 'sn', 'uid', 'dn', 'userPassword'],
        returnAttributeValues: true,
      },
    );

    if (searchResultLehrer.searchEntries.length !== 1) return false;
    if (searchResultLehrer.searchEntries[0]['givenName'] !== givenName) return false;
    if (searchResultLehrer.searchEntries[0]['surname'] !== surname) return false;
    if (searchResultLehrer.searchEntries[0]['userPassword'] !== encodeBase64(userPassword)) return false;

    return true;
  }


  public async validateGroupExists(orgaKennung: string): Promise<boolean> {
    const groupCN: string = 'lehrer-' + orgaKennung;
    const searchResultGroup: SearchResult = await this.client.search(
      `cn=groups,ou=${orgaKennung},${TestHelperLdap.BASE_DN}`,
      {
        filter: `(cn=${groupCN})`,
      },
    );

    if (!searchResultGroup.searchEntries[0]) {
      return false;
    }

    return true;
  }


  public async validateOuExists(orgaKennung: string): Promise<boolean> {
    //const orgUnitDn: string = `ou=${orgaKennung},${BASE_DN}}`;
    const searchResultOrgUnit: SearchResult = await this.client.search(`${TestHelperLdap.BASE_DN}`, {
      filter: `(ou=${orgaKennung})`,
    });

    if (!searchResultOrgUnit.searchEntries[0]) {
      return false;
    }

    return true;
  }

  public async validateOuRoleExists(orgUnitDn: string): Promise<boolean> {
    const orgRoleDn: string = `cn=groups,${orgUnitDn}`;
    const searchResultOrgRole: SearchResult = await this.client.search(orgUnitDn, {
      filter: `(cn=groups)`,
    });
    if (!searchResultOrgRole.searchEntries[0]) {
      return false;
    }

    return true;
  }

  public async validateGroupOfNamesExists(groupId: string, orgRoleDn: string): Promise<boolean> {
    const searchResultGroupOfNames: SearchResult = await this.client.search(orgRoleDn, {
      filter: `(cn=${groupId})`,
    });
    if (!searchResultGroupOfNames.searchEntries[0]) {
      return false;
    }

    return true;
  }

  /**
   * This search/validate function comes from the original BE-service.
   */
  private isPersonInGroup(groupOfNamesSearchEntry: Entry, lehrerUid: string): boolean {
    const member: string | string[] | Buffer | Buffer[] | undefined = groupOfNamesSearchEntry['member'];

    if (typeof member === 'string') {
      return member === lehrerUid;
    }

    if (Buffer.isBuffer(member)) {
      return member.toString() === lehrerUid;
    }

    if (Array.isArray(member)) {
      return member.some((entry: string | Buffer) => {
        if (typeof entry === 'string') {
          return entry === lehrerUid;
        }
        return entry.toString() === lehrerUid;
      });
    }

    return false;
  }

  /**
   * This retry-wrapper function comes from the original BE-service, but logging-methods were replaced by their console-equivalents.
   */
  private async executeWithRetry<T>(
    func: () => Promise<Result<T>>,
    retries: number,
    delay: number = 1000,
  ): Promise<Result<T>> {
    let currentAttempt: number = 1;
    let result: Result<T, Error> = {
      ok: false,
      error: new Error('executeWithRetry default fallback'),
    };

    while (currentAttempt <= retries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        result = await func();
        if (result.ok) {
          return result;
        } else {
          throw new Error(`Function returned error: ${result.error.message}`);
        }
      } catch (error) {
        const currentDelay: number = delay * Math.pow(currentAttempt, 3);
        console.warn(
          `Attempt ${currentAttempt} failed. Retrying in ${currentDelay}ms... Remaining retries: ${retries - currentAttempt}`,
        );

        // eslint-disable-next-line no-await-in-loop
        await this.sleep(currentDelay);
      }
      currentAttempt++;
    }
    console.error(`All ${retries} attempts failed. Exiting with failure.`)
    return result;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
  }

}


