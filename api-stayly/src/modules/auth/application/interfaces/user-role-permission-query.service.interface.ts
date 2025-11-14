/**
 * IUserRolePermissionQueryService provides query capabilities for user roles and permissions
 * This interface abstracts RBAC service dependency from auth module
 * Following Adapter Pattern to decouple auth module from RBAC domain
 */
export interface UserRolePermissionData {
  roles: string[];
  permissions: string[];
}

export interface IUserRolePermissionQueryService {
  /**
   * Gets roles and permissions for a user by user ID
   * Merges permissions from roles and direct user permissions
   * @param userId - User ID
   * @returns User roles and merged permissions
   */
  getUserRolesAndPermissions(userId: string): Promise<UserRolePermissionData>;
}

export const USER_ROLE_PERMISSION_QUERY_SERVICE =
  "USER_ROLE_PERMISSION_QUERY_SERVICE";
