/**
 * IUserRoleLinkPort encapsulates persistence-side role assignment logic.
 * Command handlers rely on this abstraction to remain framework agnostic.
 */
export interface IUserRoleLinkPort {
  /**
   * Replaces current role assignments for the given user.
   * @param userId - Target user identifier
   * @param roleCodes - Pre-validated role codes
   */
  replaceUserRoles(userId: string, roleCodes: string[]): Promise<void>;
}

export const USER_ROLE_LINK_PORT = 'USER_ROLE_LINK_PORT';


