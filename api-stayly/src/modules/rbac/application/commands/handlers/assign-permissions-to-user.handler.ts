/**
 * AssignPermissionsToUserHandler validates and applies new permission set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionsToUserCommand } from '../assign-permissions-to-user.command';
import type { IUserRolePermissionPort } from '../../../../user/application/interfaces/user-role-permission.port';
import { USER_ROLE_PERMISSION_PORT } from '../../../../user/application/interfaces/user-role-permission.port';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';

@Injectable()
@CommandHandler(AssignPermissionsToUserCommand)
export class AssignPermissionsToUserHandler
  implements ICommandHandler<AssignPermissionsToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_ROLE_PERMISSION_PORT)
    private readonly userRolePermissionPort: IUserRolePermissionPort,
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
    // Validate permissions using RBAC validation port
    const validatedPermissionCodes =
      await this.rolePermissionValidation.validatePermissions(
        command.permissions,
      );

    // Update user permissions using User module port (returns updated user DTO)
    return this.userRolePermissionPort.updateUserPermissions(
      command.userId,
      validatedPermissionCodes,
    );
  }
}
