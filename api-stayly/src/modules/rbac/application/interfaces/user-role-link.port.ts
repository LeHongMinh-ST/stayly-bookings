/**
 * IUserRoleLinkPort encapsulates persistence-side role assignment logic.
 * Command handlers rely on this abstraction to remain framework agnostic.
 */
export interface IUserRoleLinkPort {
  /**
   * Replaces current role assignments for the given user.
   * @param userId - Target user identifier
   * @param roleIds - Pre-validated role IDs
   */
  replaceUserRoles(userId: string, roleIds: string[]): Promise<void>;

  /**
   * Adds a single role to user (if not already assigned)
   * @param userId - Target user identifier
   * @param roleId - Pre-validated role ID
   */
  addRoleToUser(userId: string, roleId: string): Promise<void>;

  /**
   * Removes a single role from user
   * @param userId - Target user identifier
   * @param roleId - Pre-validated role ID
   */
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
}

export const USER_ROLE_LINK_PORT = "USER_ROLE_LINK_PORT";
