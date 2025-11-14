/**
 * IRolePermissionValidationPort provides validation capabilities for roles and permissions
 * Port/Adapter Pattern - RBAC module exports this port, User module uses it
 */
export interface IRolePermissionValidationPort {
  /**
   * Validates role IDs by checking if roles exist and have permissions assigned
   * @param roleIds - Array of role IDs to validate
   * @returns Array of valid role IDs
   * @throws Error if any role ID is invalid or role has no permissions
   */
  validateRoles(roleIds: string[]): Promise<string[]>;

  /**
   * Validates permission codes against catalog
   * @param permissionCodes - Array of permission codes to validate
   * @returns Array of valid permission codes
   * @throws Error if any permission code is invalid
   */
  validatePermissions(permissionCodes: string[]): Promise<string[]>;
}

export const ROLE_PERMISSION_VALIDATION_PORT =
  "ROLE_PERMISSION_VALIDATION_PORT";
