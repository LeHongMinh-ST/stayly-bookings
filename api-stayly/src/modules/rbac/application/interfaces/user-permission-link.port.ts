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
}

export const USER_PERMISSION_LINK_PORT = 'USER_PERMISSION_LINK_PORT';


