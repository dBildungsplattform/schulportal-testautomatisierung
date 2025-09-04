export class LdapError extends Error {
  public constructor(
    message: string = 'Error occurred during LDAP operation',
    public readonly code: string = 'LDAP_ERROR',
    public readonly details?: unknown[] | Record<string, unknown>,
  ) {
    super(message);
  }
}