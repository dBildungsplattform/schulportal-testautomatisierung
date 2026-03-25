import { LdapError } from './ldap.error';

export class LdapOperationError extends LdapError {
  public constructor(
    operation: string,
    public readonly details?: unknown[] | Record<string, unknown>,
  ) {
    super(`Error occurred during LDAP operation:${operation}`);
  }
}
