/**
 * AssignPermissionsToUserHandler validates and applies new permission set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionsToUserCommand } from '../assign-permissions-to-user.command';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../../user/domain/repositories/user.repository.interface';
import { UserId } from '../../../../user/domain/value-objects/user-id.vo';
import { UserPermission } from '../../../../user/domain/value-objects/user-permission.vo';
import { User } from '../../../../user/domain/entities/user.entity';

@Injectable()
@CommandHandler(AssignPermissionsToUserCommand)
export class AssignPermissionsToUserHandler
  implements ICommandHandler<AssignPermissionsToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  /**
   * Executes permission assignment ensuring catalog compliance
   * Uses ports to avoid direct business logic coupling
   */
  async execute(
    command: AssignPermissionsToUserCommand,
  ): Promise<UserResponseDto> {
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate permissions using RBAC validation port
    const validatedPermissionCodes =
      await this.rolePermissionValidation.validatePermissions(
        command.permissions,
      );

    const nextPermissions = validatedPermissionCodes.map((code) =>
      UserPermission.create(code),
    );
    const updatedUser = User.rehydrate({
      id: user.getId(),
      email: user.getEmail(),
      fullName: user.getFullName(),
      passwordHash: user.getPasswordHash(),
      status: user.getStatus(),
      roles: user.getRoles(),
      permissions: nextPermissions,
    });
    await this.userRepository.save(updatedUser);
    return UserResponseDto.fromAggregate(updatedUser);
  }
}
