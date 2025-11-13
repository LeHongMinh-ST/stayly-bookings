/**
 * IPermissionAssignmentPort provides permission assignment capabilities
 * Port for User module to assign permissions to users
 */
import { Permission } from '../../domain/value-objects/permission.vo';

export interface IPermissionAssignmentPort {
  /**
   * Assigns permissions to a user
   * @param userId - User ID
   * @param permissions - Array of permission codes
   */
  assignPermissionsToUser(userId: string, permissions: string[]): Promise<void>;

  /**
   * Gets all available permissions from catalog
   */
  getAllPermissions(): Promise<Permission[]>;

  /**
   * Gets permissions by codes
   * @param codes - Array of permission codes
   */
  getPermissionsByCodes(codes: string[]): Promise<Permission[]>;
}

export const PERMISSION_ASSIGNMENT_PORT = 'PERMISSION_ASSIGNMENT_PORT';

