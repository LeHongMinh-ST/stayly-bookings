/**
 * IUserAuthorizationPort exposes cross-module capabilities to evaluate user privileges.
 * The application layer depends on this abstraction to avoid direct coupling to RBAC infrastructure.
 */
export interface IUserAuthorizationPort {
  /**
   * Determines whether the provided user ID belongs to a super admin.
   * @param userId - Authenticated user identifier
   * @returns True when the user owns super admin privileges
   */
  isSuperAdmin(userId: string): Promise<boolean>;
}

export const USER_AUTHORIZATION_PORT = "USER_AUTHORIZATION_PORT";
