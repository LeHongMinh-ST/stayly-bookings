/**
 * AssignRolesToUserHandler validates and applies new role set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesToUserCommand } from '../assign-roles-to-user.command';
import type { IUserRolePermissionPort } from '../../../../user/application/interfaces/user-role-permission.port';
import { USER_ROLE_PERMISSION_PORT } from '../../../../user/application/interfaces/user-role-permission.port';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';

@Injectable()
@CommandHandler(AssignRolesToUserCommand)
export class AssignRolesToUserHandler
  implements ICommandHandler<AssignRolesToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_ROLE_PERMISSION_PORT)
    private readonly userRolePermissionPort: IUserRolePermissionPort,
    @Inject(ROLE_PERMISSION_VALIDATION_PORT)
    private readonly rolePermissionValidation: IRolePermissionValidationPort,
  ) {}

  /**
   * Executes role assignment ensuring catalog compliance
   * Uses ports to avoid direct business logic coupling
   */
  async execute(command: AssignRolesToUserCommand): Promise<UserResponseDto> {
    // Validate roles using RBAC validation port
    const validatedRoleCodes =
      await this.rolePermissionValidation.validateRoles(command.roles);

    // Update user roles using User module port (returns updated user DTO)
    return this.userRolePermissionPort.updateUserRoles(
      command.userId,
      validatedRoleCodes,
    );
  }
}
