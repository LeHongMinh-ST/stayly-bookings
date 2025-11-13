/**
 * UserRolePermissionQueryService provides query capabilities for user roles and permissions
 * This service implements IUserRolePermissionQueryPort and encapsulates role/permission query logic
 * Following Port/Adapter Pattern - service implements port defined in application layer
 */
import { Inject, Injectable } from '@nestjs/common';
import type {
  IUserRolePermissionQueryPort,
  UserRolePermissionData,
} from '../../application/interfaces/user-role-permission-query.port';
import { USER_ROLE_PERMISSION_QUERY_PORT } from '../../application/interfaces/user-role-permission-query.port';
import type { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import type { IUserRolePermissionPort } from '../../../user/application/interfaces/user-role-permission.port';
import { USER_ROLE_PERMISSION_PORT } from '../../../user/application/interfaces/user-role-permission.port';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../user/domain/repositories/user.repository.interface';
import { UserId } from '../../../user/domain/value-objects/user-id.vo';

@Injectable()
export class UserRolePermissionQueryService
  implements IUserRolePermissionQueryPort
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  /**
   * Gets roles and permissions for a user by user ID
   * Merges permissions from roles and direct user permissions
   * @param userId - User ID
   * @returns User roles and merged permissions
   */
  async getUserRolesAndPermissions(
    userId: string,
  ): Promise<UserRolePermissionData> {
    const userIdVo = UserId.create(userId);
    const user = await this.userRepository.findById(userIdVo);
    if (!user) {
      throw new Error('User not found');
    }

    // Get role codes from user
    const roleCodes = user.getRoles().map((role) => role.getValueAsString());

    // Get permissions directly assigned to user
    const directPermissions = user
      .getPermissions()
      .map((permission) => permission.getValue());

    // Load roles with permissions to get permissions from roles
    const allPermissions = new Set<string>(directPermissions);
    if (roleCodes.length > 0) {
      const roles = await this.roleRepository.findAll();
      const userRoles = roles.filter((role) =>
        roleCodes.includes(role.getCode()),
      );

      for (const role of userRoles) {
        const rolePermissions = role.getPermissions().map((p) => p.getValue());
        rolePermissions.forEach((perm) => allPermissions.add(perm));
      }
    }

    return {
      roles: roleCodes,
      permissions: Array.from(allPermissions),
    };
  }
}

