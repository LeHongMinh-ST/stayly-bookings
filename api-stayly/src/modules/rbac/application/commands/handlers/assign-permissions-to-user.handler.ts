/**
 * AssignPermissionsToUserHandler validates and applies new permission set for users
 */
import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignPermissionsToUserCommand } from '../assign-permissions-to-user.command';
import type { IRolePermissionValidationPort } from '../../interfaces/role-permission-validation.port';
import { ROLE_PERMISSION_VALIDATION_PORT } from '../../interfaces/role-permission-validation.port';
import type { IUserAccessPort } from '../../../../user/application/interfaces/user-access.port';
import { USER_ACCESS_PORT } from '../../../../user/application/interfaces/user-access.port';
import { UserResponseDto } from '../../../../user/application/dto/response/user-response.dto';
import type { IUserPermissionLinkPort } from '../../interfaces/user-permission-link.port';
import { USER_PERMISSION_LINK_PORT } from '../../interfaces/user-permission-link.port';

@Injectable()
@CommandHandler(AssignPermissionsToUserCommand)
export class AssignPermissionsToUserHandler
  implements ICommandHandler<AssignPermissionsToUserCommand, UserResponseDto>
{
  constructor(
    @Inject(USER_ACCESS_PORT)
    private readonly userAccessPort: IUserAccessPort,
    @Inject(USER_PERMISSION_LINK_PORT)
    private readonly userPermissionLinkPort: IUserPermissionLinkPort,
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
    await this.userAccessPort.ensureUserExists(command.userId);

    // Validate permissions using RBAC validation port
    const validatedPermissionCodes =
      await this.rolePermissionValidation.validatePermissions(
        command.permissions,
      );

    await this.userPermissionLinkPort.replaceUserPermissions(
      command.userId,
      validatedPermissionCodes,
    );
    return await this.userAccessPort.getUserResponse(command.userId);
  }
}
