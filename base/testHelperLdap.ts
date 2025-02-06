import { Client, Entry, SearchResult } from 'ldapts';
import { LdapOperationError } from './ldap/error/ldap-operation.error';

declare type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

const encodeBase64 = (str: string): string => Buffer.from(str, 'binary').toString('base64');

export class TestHelperLdap {
  // Default-retries of 3 equals the value defined for BE.
  private static readonly DEFAULT_RETRIES: number = 3; // e.g. DEFAULT_RETRIES = 3 will produce retry sequence: 1sek, 8sek, 27sek (1000ms * retrycounter^3)
  private static readonly GROUPS: string = 'cn=groups';
  private static readonly BASE_DN: string = 'dc=schule-sh,dc=de';
  private static readonly BIND_DN: string = 'cn=admin,dc=schule-sh,dc=de';
  private static readonly OEFFENTLICHE_SCHULEN_OU: string = 'ou=oeffentlicheSchulen';
  private static readonly ERSATZ_SCHULEN_OU: string = 'ou=ersatzSchulen';

  private client: Client = new Client({
    url: this.ldapUrl,
    timeout: 3000,
  });

  /**
   *
   * @param ldapUrl the url of LDAP e.g.ldap://localhost
   * @param ldapAdminPassword the password that is used at the bind-dn
   * @param retries specifies the amount of retries used for methods which are using retries (see method-docs), defaults is 3
   */
  public constructor(private ldapUrl: string, private ldapAdminPassword: string, private retries: number = TestHelperLdap.DEFAULT_RETRIES) {

  }

  //** PUBLIC methods for direct usage in tests */

  /**
   * Checks whether a user-entry exists in LDAP for the specified username.
   * Uses retries for enhanced reliability of the LDAP-request and its result.
   * @param username
   */
  public async validateUserExists(username: string): Promise<boolean> {
    const res: Result<Entry> = await this.executeWithRetry(() => this.getUser(username));

    return res.ok && !!res.value;
  }

  /**
   * Checks whether a organizationalUnit-entry exists in LDAP for the specified orgaKennung.
   * Uses retries for enhanced reliability of the LDAP-request and its result.
   * @param orgaKennung
   */
  public async validateOuExists(orgaKennung: string): Promise<boolean> {
    const res: Result<Entry> = await this.executeWithRetry(() => this.getOu(orgaKennung));

    return res.ok && !!res.value;
  }

  /**
   * Checks whether a organizationalRole-entry exists in LDAP for the specified orgaKennung.
   * Uses retries for enhanced reliability of the LDAP-request and its result.
   * @param orgaKennung
   */
  public async validateOuRoleExists(orgaKennung: string): Promise<boolean> {
    const res: Result<Entry> = await this.executeWithRetry(() => this.getOuRole(orgaKennung));

    return res.ok && !!res.value;
  }

  /**
   * Checks whether a groupOfNames-entry exists in LDAP for the specified orgaKennung.
   * Uses retries for enhanced reliability of the LDAP-request and its result.
   * @param orgaKennung
   */
  public async validateGroupOfNamesExists(orgaKennung: string): Promise<boolean> {
    const res: Result<Entry> = await this.executeWithRetry(() => this.getGroupOfNames(orgaKennung));

    return res.ok && !!res.value;
  }

  /**
   * Checks whether the uid for a specified username is contained as member in a groupOfNames-entry specified by an orgaKennung.
   * Uses retries for enhanced reliability of the LDAP-request and its result.
   * @param username
   * @param orgaKennung
   */
  public async validateUserIsInGroupOfNames(username: string, orgaKennung: string): Promise<boolean> {
    const res: Result<boolean> = await this.executeWithRetry(() => this.checkUserIsInGroupOfNames(username, orgaKennung));

    return res.ok && res.value;
  }


  //** PRIVATE methods */

  private async bind(): Promise<void> {
    await this.client.bind(TestHelperLdap.BIND_DN, this.ldapAdminPassword);
  }

  private async unbind(): Promise<void> {
    await this.client.unbind();
  }

  private async getUser(username: string): Promise<Result<Entry>> {
    await this.bind();

    try {
      const searchResultLehrer: SearchResult = await this.client.search(
        `${TestHelperLdap.OEFFENTLICHE_SCHULEN_OU},${TestHelperLdap.BASE_DN}`,
        {
          scope: 'sub',
          filter: `(uid=${username})`,
        },
      );
      await this.unbind();
      return {
        ok: true,
        value: searchResultLehrer.searchEntries[0],
      };
    } catch(ex) {
      await this.unbind();
      return {
        ok: false,
        error: new LdapOperationError('getUser'),
      };
    }
  }

  private async getOu(orgaKennung: string): Promise<Result<Entry>> {
    await this.bind();

    try {
      const searchResultOrgUnit: SearchResult = await this.client.search(`${TestHelperLdap.BASE_DN}`, {
        filter: `(ou=${orgaKennung})`,
      });
      await this.unbind();

      return {
        ok: true,
        value: searchResultOrgUnit.searchEntries[0],
      };
    } catch(ex) {
      await this.unbind();
      return {
        ok: false,
        error: new LdapOperationError('getOU'),
      };
    }
  }

  private async getOuRole(orgaKennung: string): Promise<Result<Entry>> {
    await this.bind();

    try {
      const orgUnitDn: string = `ou=${orgaKennung},${TestHelperLdap.BASE_DN}`;
      const searchResultOrgRole: SearchResult = await this.client.search(orgUnitDn, {
        filter: `(${TestHelperLdap.GROUPS})`,
      });
      await this.unbind();

      return {
        ok: true,
        value: searchResultOrgRole.searchEntries[0],
      };
    } catch(ex) {
      await this.unbind();
      return {
        ok: false,
        error: new LdapOperationError('getOuRole'),
      };
    }
  }

  private async getGroupOfNames(orgaKennung: string): Promise<Result<Entry>> {
    await this.bind();

    try {
      const orgUnitDn: string = `ou=${orgaKennung},${TestHelperLdap.BASE_DN}`;
      const searchResultGroupOfNames: SearchResult = await this.client.search(orgUnitDn, {
        filter: `(cn=lehrer-${orgaKennung})`,
      });
      await this.unbind();

      return {
        ok: true,
        value: searchResultGroupOfNames.searchEntries[0],
      };
    } catch(ex) {
      await this.unbind();
      return {
        ok: false,
        error: new LdapOperationError('getGroupOfNames'),
      };
    }
  }

  private async checkUserIsInGroupOfNames(username: string, orgaKennung: string): Promise<Result<boolean>> {
    await this.bind();

    try {
      const groupOfNames: Result<Entry> = await this.getGroupOfNames(orgaKennung);
      if (!groupOfNames.ok) return groupOfNames;
      const userUid: string = `uid=${username},${TestHelperLdap.OEFFENTLICHE_SCHULEN_OU},${TestHelperLdap.BASE_DN}`;
      const isUserInGroup: boolean = this.isUserInGroup(groupOfNames.value, userUid);
      await this.unbind();
      return {
        ok: true,
        value: isUserInGroup,
      };
    } catch(ex) {
      await this.unbind();
      return {
        ok: false,
        error: new LdapOperationError('checkUserIsInGroupOfNames'),
      };
    }
  }

  private async checkUserAttributes(username: string, surname: string, givenName: string, userPassword): Promise<boolean> {
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

  /**
   * This search/validate function comes from the original BE-service.
   */
  private isUserInGroup(groupOfNamesEntry: Entry, userUid: string): boolean {
    const member: string | string[] | Buffer | Buffer[] | undefined = groupOfNamesEntry['member'];

    if (typeof member === 'string') {
      return member === userUid;
    }

    if (Buffer.isBuffer(member)) {
      return member.toString() === userUid;
    }

    if (Array.isArray(member)) {
      return member.some((entry: string | Buffer) => {
        if (typeof entry === 'string') {
          return entry === userUid;
        }
        return entry.toString() === userUid;
      });
    }

    return false;
  }

  /**
   * This retry-wrapper function comes from the original BE-service, but logging-methods were replaced by their console-equivalents,
   * retries and delay are both optional here.
   */
  private async executeWithRetry<T>(
    func: () => Promise<Result<T>>,
    retries: number = this.retries,
    delay: number = 1000,
  ): Promise<Result<T>> {
    let currentAttempt: number = 1;
    let result: Result<T> = {
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


