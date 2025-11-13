/**
 * IUserRolePermissionQueryPort provides query capabilities for user roles and permissions
 * Port for other modules (e.g., auth module) to query user roles and permissions
 * Following Port/Adapter Pattern - Port is defined in application layer
 */

export interface UserRolePermissionData {
  roles: string[];
  permissions: string[];
}

export interface IUserRolePermissionQueryPort {
  /**
   * Gets roles and permissions for a user by user ID
   * Merges permissions from roles and direct user permissions
   * @param userId - User ID
   * @returns User roles and merged permissions
   */
  getUserRolesAndPermissions(userId: string): Promise<UserRolePermissionData>;
}

export const USER_ROLE_PERMISSION_QUERY_PORT = 'USER_ROLE_PERMISSION_QUERY_PORT';

