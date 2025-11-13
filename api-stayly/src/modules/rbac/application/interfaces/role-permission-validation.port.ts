/**
 * IRolePermissionValidationPort provides validation capabilities for roles and permissions
 * Port/Adapter Pattern - RBAC module exports this port, User module uses it
 */
export interface IRolePermissionValidationPort {
  /**
   * Validates role codes against catalog
   * @param roleCodes - Array of role codes to validate
   * @returns Array of valid role codes
   * @throws Error if any role code is invalid
   */
  validateRoles(roleCodes: string[]): Promise<string[]>;

  /**
   * Validates permission codes against catalog
   * @param permissionCodes - Array of permission codes to validate
   * @returns Array of valid permission codes
   * @throws Error if any permission code is invalid
   */
  validatePermissions(permissionCodes: string[]): Promise<string[]>;
}

export const ROLE_PERMISSION_VALIDATION_PORT = 'ROLE_PERMISSION_VALIDATION_PORT';

