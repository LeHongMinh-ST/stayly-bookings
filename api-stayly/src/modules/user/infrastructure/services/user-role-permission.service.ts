/**
 * UserRolePermissionService implements IUserRolePermissionPort
 * Allows RBAC module to update user roles/permissions without knowing User entity details
 */
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRolePermissionPort } from '../../application/interfaces/user-role-permission.port';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRole } from '../../domain/value-objects/user-role.vo';
import { UserPermission } from '../../domain/value-objects/user-permission.vo';
import { UserResponseDto } from '../../application/dto/response/user-response.dto';

@Injectable()
export class UserRolePermissionService implements IUserRolePermissionPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async updateUserRoles(
    userId: string,
    roleCodes: string[],
  ): Promise<UserResponseDto> {
    if (!roleCodes.length) {
      throw new Error('User must have at least one role');
    }

    const userIdVo = UserId.create(userId);
    const user = await this.userRepository.findById(userIdVo);
    if (!user) {
      throw new Error('User not found');
    }

    // Convert role codes to local UserRole value objects
    const roles = roleCodes.map((code) => UserRole.from(code));
    user.assignRoles(roles);
    await this.userRepository.save(user);
    return UserResponseDto.fromAggregate(user);
  }

  async updateUserPermissions(
    userId: string,
    permissionCodes: string[],
  ): Promise<UserResponseDto> {
    const userIdVo = UserId.create(userId);
    const user = await this.userRepository.findById(userIdVo);
    if (!user) {
      throw new Error('User not found');
    }

    // Convert permission codes to local UserPermission value objects
    const permissions = permissionCodes.map((code) =>
      UserPermission.create(code),
    );
    user.assignPermissions(permissions);
    await this.userRepository.save(user);
    return UserResponseDto.fromAggregate(user);
  }
}
