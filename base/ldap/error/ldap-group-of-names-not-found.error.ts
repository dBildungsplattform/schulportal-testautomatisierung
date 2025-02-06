export class LdapGroupOfNamesNotFoundError extends Error {
  public constructor(
    message: string = 'GroupOfNames not found in LDAP',
    public readonly code: string = 'LDAP_NOT_FOUND_GROUP_OF_NAMES',
    public readonly details?: unknown[] | Record<string, unknown>,
  ) {
    super(message);
  }
}