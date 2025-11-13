/**
 * IUserRolePermissionPort provides interface for RBAC module to update user roles/permissions
 * Port/Adapter Pattern - User module exports this port, RBAC module uses it
 */
import { UserResponseDto } from '../dto/response/user-response.dto';

export interface IUserRolePermissionPort {
  /**
   * Updates roles for a user
   * @param userId - User ID
   * @param roleCodes - Array of role codes (validated by RBAC module)
   * @returns Updated user DTO
   */
  updateUserRoles(userId: string, roleCodes: string[]): Promise<UserResponseDto>;

  /**
   * Updates permissions for a user
   * @param userId - User ID
   * @param permissionCodes - Array of permission codes (validated by RBAC module)
   * @returns Updated user DTO
   */
  updateUserPermissions(
    userId: string,
    permissionCodes: string[],
  ): Promise<UserResponseDto>;
}

export const USER_ROLE_PERMISSION_PORT = 'USER_ROLE_PERMISSION_PORT';

