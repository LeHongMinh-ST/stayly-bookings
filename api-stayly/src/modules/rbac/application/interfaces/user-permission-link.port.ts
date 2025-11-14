/**
 * IUserPermissionLinkPort encapsulates persistence logic for direct permission assignments.
 */
export interface IUserPermissionLinkPort {
  /**
   * Replaces direct permission assignments for the specified user.
   * @param userId - Target user identifier
   * @param permissionCodes - Pre-validated permission codes
   */
  replaceUserPermissions(
    userId: string,
    permissionCodes: string[],
  ): Promise<void>;

  /**
   * Adds a single permission to user (if not already assigned)
   * @param userId - Target user identifier
   * @param permissionCode - Pre-validated permission code
   */
  addPermissionToUser(userId: string, permissionCode: string): Promise<void>;

  /**
   * Removes a single permission from user
   * @param userId - Target user identifier
   * @param permissionCode - Pre-validated permission code
   */
  removePermissionFromUser(
    userId: string,
    permissionCode: string,
  ): Promise<void>;
}

export const USER_PERMISSION_LINK_PORT = "USER_PERMISSION_LINK_PORT";
