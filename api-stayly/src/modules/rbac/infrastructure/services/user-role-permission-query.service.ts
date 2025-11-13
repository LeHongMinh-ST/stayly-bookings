/**
 * UserRolePermissionQueryService provides query capabilities for user roles and permissions
 * This service implements IUserRolePermissionQueryPort and encapsulates role/permission query logic
 * Following Port/Adapter Pattern - service implements port defined in application layer
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  IUserRolePermissionQueryPort,
  UserRolePermissionData,
} from '../../application/interfaces/user-role-permission-query.port';
import { RoleOrmEntity } from '../persistence/entities/role.orm-entity';
import { UserOrmEntity } from '../../../user/infrastructure/persistence/entities/user.orm-entity';

@Injectable()
export class UserRolePermissionQueryService
  implements IUserRolePermissionQueryPort
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'permissions'],
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Get role codes directly from ORM entity
    const roleCodes = (user.roles ?? []).map((role) => role.code);

    // Get permissions directly assigned to user
    const directPermissions = (user.permissions ?? []).map(
      (permission) => permission.code,
    );

    // Load roles with permissions to get permissions from roles
    const allPermissions = new Set<string>(directPermissions);
    if (roleCodes.length > 0) {
      const roles = await this.roleRepository.find({
        where: roleCodes.map((code) => ({ code })),
        relations: ['permissions'],
      });

      for (const role of roles) {
        const rolePermissions = (role.permissions ?? []).map(
          (permission) => permission.code,
        );
        rolePermissions.forEach((perm) => allPermissions.add(perm));
      }
    }

    return {
      roles: roleCodes,
      permissions: Array.from(allPermissions),
    };
  }
}

